<?php

define('_PS_TRANS_PATTERN_',            '(.*[^\\\\])');

function parse($regex, $content) {
  $matches = [];
  $strings = [];
  $n = preg_match_all($regex, $content, $matches);
  for ($i = 0; $i < $n; $i += 1) {
    $quote = $matches[1][$i];
    $string = $matches[2][$i];
    $value = $string;
    if ($quote === '"') {
      $value = escape($value);
    }
    $md5 = strtolower(md5($value));
    $strings[$md5] = $string;
  }
  return $strings;
}

function escape($value) {
  $value = str_replace('\'', '\\\'', $value);
  $value = preg_replace('/\\\\+"/', '"', $value);
  return $value;
}

function parsePHP($content) {
  $regex = '/->l\((\')'._PS_TRANS_PATTERN_.'\'(, ?\'(.+)\')?(, ?(.+))?\)/U';
  return parse($regex, $content);
}

function parseTemplate($content) {
  $regex = '/\{l\s*s=([\'\"])'._PS_TRANS_PATTERN_.'\1.*\s+mod=\'revws\'.*\}/U';
  return parse($regex, $content);
}

function registerTranslation(&$ret, $key, $str, $filename) {
  if (! isset($ret[$key])) {
    $ret[$key] = [
      'text' => $str,
      'files' => [ $filename ]
    ];
  } else {
    $ret[$key]['files'][] = $filename;
    $ret[$key]['files'] = array_unique($ret[$key]['files']);
  }
}

function findTranslations() {
  $ret = [];
  // 1. js translation
  $frontKeys = json_decode(file_get_contents('build/front-translation-keys.json'), true);
  foreach ($frontKeys as $str) {
    $key = strtolower(md5(escape($str)));
    registerTranslation($ret, $key, $str, 'app-translation');
  }
  $backKeys = json_decode(file_get_contents('build/back-translation-keys.json'), true);
  foreach ($backKeys as $str) {
    $key = strtolower(md5(escape($str)));
    registerTranslation($ret, $key, $str, 'app-translation');
  }

  // 2. php translation
  $it = new RecursiveDirectoryIterator("php");
  $process = [
    'php' => 'parsePHP',
    'tpl' => 'parseTemplate'
  ];
  foreach(new RecursiveIteratorIterator($it) as $file) {
    $arr = explode('.', $file);
    $ext = strtolower(array_pop($arr));
    if (isset($process[$ext])) {
      $content = file_get_contents($file);
      $strings = $process[$ext]($content);
      if ($strings) {
        $filename = str_replace(".$ext", "", strtolower(basename($file)));
        foreach ($strings as $key => $str) {
          registerTranslation($ret, $key, $str, $filename);
        }
      }
    }
  }
  return $ret;
}

function getKeys($translations) {
  $keys = [];
  foreach ($translations as $t) {
    $keys[$t['text']] = "";
  }
  ksort($keys);
  return $keys;
}

function mergeKeys($file, $keys) {
  $existing = json_decode(file_get_contents($file), true);
  $sorted = $keys;
  ksort($sorted);
  $allKeys = [];
  $translated = [];
  foreach ($sorted as $key => $value) {
    if (isset($existing[$key]) && $existing[$key]) {
      $allKeys[$key] = $existing[$key];
      $translated[$key] = $existing[$key];
    } else {
      $allKeys[$key] = "";
    }
  }
  foreach ($existing as $key => $value) {
    if ($value && !isset($allKeys[$key])) {
      $allKeys[$key] = $value;
    }
  }
  file_put_contents($file, json_encode($allKeys, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
  return $translated;
}

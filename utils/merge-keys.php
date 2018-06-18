<?php
require_once(dirname(__FILE__) . '/translation.php');

$translations = findTranslations();
$total = count($translations);
$keys = getKeys($translations);

foreach (glob("translations/*.json") as $file) {
  $lang = str_replace('.json', '', basename($file));
  $translated = mergeKeys($file, $keys);
  $cnt = 0;
  $lines = [];
  foreach ($translations as $md5 => $t) {
    $text = $t['text'];
    if (isset($translated[$text])) {
      $cnt++;
      foreach ($t['files'] as $file) {
        $trankey = "<{revws}prestashop>{$file}_{$md5}";
        $lines[$trankey] = $translated[$text];
      }
    }
  }
  $perc = round(10000 * $cnt / $total) / 100;
  ksort($lines);
  if ($lines) {
    $content = "<?php\n\nglobal \$_MODULE;\n\$_MODULE = array();\n";
    foreach ($lines as $key=>$value) {
      $content .= "\$_MODULE['$key'] = '".str_replace("'", "\\'", $value)."';\n";
    }
    $output = "./build/staging/revws/translations/$lang.php";
    file_put_contents($output, $content);
    echo "Translation '$lang': $cnt strings translated [ $perc% ]\n";
  }
}

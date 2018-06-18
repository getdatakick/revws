<?php
require_once(dirname(__FILE__) . '/translation.php');

$translations = findTranslations();
foreach (glob("php/translations/*.php") as $file) {
  $_MODULE = [];
  require_once($file);
  $extracted = [];
  foreach ($_MODULE as $key=>$text) {
    $md5 = strtolower(substr($key, -32));
    if (isset($translations[$md5])) {
      $tran = $translations[$md5];
      $extracted[$tran['text']] = $text;
    }
  }
  ksort($extracted);
  $filename = str_replace(".php", ".json", basename($file));
  file_put_contents("translations/$filename", json_encode($extracted, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

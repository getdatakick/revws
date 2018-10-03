<?php
/**
* Copyright (C) 2017-2018 Petr Hucik <petr@getdatakick.com>
*
* NOTICE OF LICENSE
*
* This source file is subject to the Academic Free License (AFL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* http://opensource.org/licenses/afl-3.0.php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to license@getdatakick.com so we can send you a copy immediately.
*
* @author    Petr Hucik <petr@getdatakick.com>
* @copyright 2017-2018 Petr Hucik
* @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*/

namespace Revws;

class CsvReader {
  private $input;
  private $separator;
  private $eol;
  private $outputEncoding = false;
  private $convertFrom = false;
  private $finished = false;
  private $columnNames;

  public function __construct($input, $hasColumnNames=true, $separator=',', $eol="\n", $inputEncoding='UTF-8', $outputEncoding='UTF-8') {
    $this->input = $input;
    $this->separator = $separator;
    $this->eol = $eol;
    $this->outputEncoding = $outputEncoding;
    if ($inputEncoding != $outputEncoding) {
      $this->convertFrom = $inputEncoding;
    }
    if ($hasColumnNames) {
      $this->columnNames = array_map('trim', $this->fetch());
    }
  }

  public function getColumnNames() {
    return $this->columnNames;
  }

  private function fetchLine() {
    if ($this->finished)
      return false;
    $line = fgets($this->input);
    if ($line === false) {
      $this->finished = true;
      fclose($this->input);
      return false;
    }
    if ($this->convertFrom) {
      $line = mb_convert_encoding($line, $this->outputEncoding, $this->convertFrom);
    }
    if (trim($line) === '') {
      return $this->fetchLine() ;
    };
    return $line;
  }

  public function fetch() {
    $o = array();
    $num = 0;
    $esc = false;
    $escesc = false;
    $o[0] = '';
    while (true) {
      $string = $this->fetchLine();
      if ($string === false)
        return false;
      $cnt = strlen($string);
      $i = 0;
      if ($i < $cnt) {
        while ($i < $cnt) {
          $s = $string[$i];
          if ($s == $this->eol) {
            if ($esc) {
              $o[$num] .= $s;
            } else {
              $i++;
              break;
            }
          } elseif ($s == $this->separator) {
            if ($esc) {
              $o[$num] .= $s;
            } else {
              $num++;
              $o[] = '';
              $esc = false;
              $escesc = false;
            }
          } elseif ($s == '"') {
            if ($escesc) {
              $o[$num] .= '"';
              $escesc = false;
            }

            if ($esc) {
              $esc = false;
              $escesc = true;
            } else {
              $esc = true;
              $escesc = false;
            }
          } else {
            if ($escesc) {
              $o[$num] .= '"';
              $escesc = false;
            }

            $o[$num] .= $s;
          }

          $i++;
        }
        if (! $esc)
          return $o;
      }
    }
  }
}

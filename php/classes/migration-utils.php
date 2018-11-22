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

class MigrationUtils {
  private $conn;
  public function __construct($conn) {
    $this->conn = $conn;
  }

  public function tableExists($table) {
    $q = "SELECT * FROM information_schema.TABLES WHERE table_schema=database() AND table_name = '$table'";
    $res = $this->conn->query($q);
    if ($res && $res->fetch()) {
      return true;
    }
    return false;
  }

  public function columnExists($table, $column) {
    $q = "SELECT * FROM information_schema.COLUMNS WHERE table_schema = database() AND table_name ='$table' AND column_name = '$column'";
    $res = $this->conn->query($q);
    if ($res && $res->fetch()) {
      return true;
    }
    return false;
  }

}

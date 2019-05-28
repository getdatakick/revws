<?php
/**
* Copyright (C) 2017-2019 Petr Hucik <petr@getdatakick.com>
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
* @copyright 2017-2019 Petr Hucik
* @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*/

namespace Revws;
use \Cookie;

class CSRFToken {
  private $token;

  public function __construct($cookie, $settings) {
    $date = date('Ymd');
    $this->token = $this->getFromCookie($cookie, $settings, $date);
    if (is_null($this->token)) {
      $this->token = $this->createToken($settings, $date);
      $cookie->__set('revwsToken', $this->token);
    }
  }

  public function getToken() {
    return $this->token;
  }

  public function validate($token) {
    $passedToken = strtolower($token);
    $cookieToken = strtolower($this->token);
    if ($cookieToken != $passedToken) {
      throw new \Exception("Invalid CSRF Token:\ncookie: $cookieToken\npassed: $passedToken\n", 900001);
    }
  }

  private function createToken($settings, $date) {
    $rand = Utils::getRandomData();
    return $rand . '-' . $this->getSignature($settings, $rand, $date);
  }

  private function getSignature($settings, $data, $date) {
    return md5($date . $settings->getSalt() . $data);
  }

  private function getFromCookie($cookie, $settings, $date) {
    if ($cookie->revwsToken) {
      $token = $cookie->revwsToken;
      $arr = explode('-', $token);
      if (count($arr) == 2) {
        $rand = $arr[0];
        $sign = $arr[1];
        $signature = $this->getSignature($settings, $rand, $date);
        if ($sign === $signature) {
          return $token;
        }
      }
    }
    return null;
  }
}

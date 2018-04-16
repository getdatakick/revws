<?php
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

  public function validate() {
    $token = $this->getFromHeaders();
    if (strtolower($this->token) != strtolower($token)) {
      throw new \Exception('Invalid CSRF Token');
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

  private function getFromHeaders() {
    $headers = array();
    if (function_exists('getallheaders')) {
      foreach (getallheaders() as $name => $value) {
        $headers[strtolower($name)] = $value;
      }
    } else {
      foreach ($_SERVER as $name => $value) {
        if (substr($name, 0, 5) == 'HTTP_') {
          $headers[strtolower(str_replace(' ', '-', str_replace('_', ' ', substr($name, 5))))] = $value;
        }
      }
    }
    return isset($headers['x-revws-token']) ? $headers['x-revws-token'] : null;
  }

}

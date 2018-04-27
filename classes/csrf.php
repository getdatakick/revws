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

  public function validate($token) {
    $passedToken = strtolower($token);
    $cookieToken = strtolower($this->token);
    if ($cookieToken != $passedToken) {
      throw new \Exception("Invalid CSRF Token:\ncookie: $cookieToken\npassed: $passedToken\n");
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

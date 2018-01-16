<?php
/**
* Copyright (C) 2017 Petr Hucik <petr@getdatakick.com>
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
* @copyright 2018 Petr Hucik
* @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*/

namespace Revws;
use \Customer;

class Visitor {
  const GUEST = 'guest';
  const CUSTOMER = 'customer';

  private $settings;
  private $type;
  private $id;
  private $firstName='';
  private $lastName='';
  private $email='';

  public function __construct($context, Settings $settings) {
    $this->settings = $settings;
    if ($context->customer->isLogged()) {
      $this->type = self::CUSTOMER;
      $this->id = $context->customer->id;
      $customer = new Customer($this->id);
      $this->email = $customer->email;
      $this->firstName = $customer->firstname;
      $this->lastName = $customer->lastname;
    } else {
      $this->type = self::GUEST;
      $this->id = $context->cookie->id_guest;
    }
  }

  public function isGuest() {
    return $this->type == self::GUEST;
  }

  public function isCustomer() {
    return $this->type == self::CUSTOMER;
  }

  public function getId() {
    return $this->id;
  }

  public function getType() {
    return $this->type;
  }

  public function getDisplayName() {
    if ($this->firstName || $this->lastName) {
      $firstName = $this->firstName ? $this->firstName : '';
      $lastName = $this->lastName ? $this->lastName : '';
      switch ($this->settings->getNamePreference()) {
        case 'firstName':
          return trim($firstName);
        case 'lastName':
          return trim($lastName);
        case 'initials':
          return trim(strtoupper(substr($firstName, 0, 1) . '.' . substr($lastName, 0, 1) . '.'));
        case 'initialLastName':
          return trim($firstName. ' ' . substr($lastName, 0, 1) . '.');
        case 'fullName':
          // fall trough
        default:
          return trim($firstName . ' ' . $lastName);
      }
    }
    return '';
  }

  public function getEmail() {
    return trim($this->email);
  }

}

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

class Shapes {
  private static $shapes = [
    'star' => [
      'label' => 'Star',
      'viewBox' => "-489 216 20 20",
      'path' => 'M-475.072 222.324l4.597.665c.932.13 1.305 1.27.63 1.93l-3.322 3.24c-.268.26-.39.637-.326 1.005l.788 4.58c.16.926-.813 1.635-1.647 1.2l-4.113-2.16c-.33-.174-.726-.173-1.057 0l-4.11 2.165c-.833.438-1.807-.27-1.65-1.197l.783-4.58c.07-.37-.06-.745-.32-1.006l-3.33-3.24c-.67-.657-.3-1.803.63-1.94l4.6-.67c.37-.054.69-.287.854-.62l2.05-4.17c.417-.843 1.62-.844 2.04 0l2.057 4.163c.166.336.486.568.856.62z',
      'strokeWidth' => 1,
    ],
    'star2' => [
      'label' => 'Star (another version)',
      'viewBox' => '80 100 600 600',
      'path' => 'm506.979706,670.34491c-31.57605,18.483215 -123.914795,-105.211609 -160.259094,-109.222778c-36.34436,-4.011108 -151.136917,96.823608 -178.367081,71.850159c-27.230286,-24.973267 59.227798,-151.793884 51.512589,-188.190521c-7.715164,-36.396484 -138.142982,-117.004639 -123.396042,-150.922241c14.746765,-33.917419 160.519485,11.397858 192.095535,-7.085419c31.576111,-18.483063 65.759796,-169.136345 102.104095,-165.125175c36.344299,4.011162 39.97879,158.838219 67.209015,183.811577c27.230286,24.973236 178.78479,12.472656 186.499939,48.869232c7.715149,36.396454 -135.81131,86.769592 -150.558136,120.687134c-14.746826,33.917511 44.735321,176.84494 13.15918,195.328033z',
      'strokeWidth' => 50
    ],
    'heart' => [
      'label' => 'Heart',
      'viewBox' => "-30 0 560 511.627",
      'path' => "M475.366,71.951c-24.175-23.606-57.575-35.404-100.215-35.404c-11.8,0-23.843,2.046-36.117,6.136   c-12.279,4.093-23.702,9.615-34.256,16.562c-10.568,6.945-19.65,13.467-27.269,19.556c-7.61,6.091-14.845,12.564-21.696,19.414   c-6.854-6.85-14.087-13.323-21.698-19.414c-7.616-6.089-16.702-12.607-27.268-19.556c-10.564-6.95-21.985-12.468-34.261-16.562   c-12.275-4.089-24.316-6.136-36.116-6.136c-42.637,0-76.039,11.801-100.211,35.404C12.087,95.552,0,128.288,0,170.162 c0,12.753,2.24,25.889,6.711,39.398c4.471,13.514,9.566,25.031,15.275,34.546c5.708,9.514,12.181,18.796,19.414,27.837   c7.233,9.042,12.519,15.27,15.846,18.699c3.33,3.422,5.948,5.899,7.851,7.419L243.25,469.937c3.427,3.429,7.614,5.144,12.562,5.144   s9.138-1.715,12.563-5.137l177.87-171.307c43.588-43.583,65.38-86.41,65.38-128.475C511.626,128.288,499.537,95.552,475.366,71.951z",
      'strokeWidth' => 30
    ]
  ];

  public static function getDefaultShape() {
    return 'star';
  }

  public static function getAvailableShapes() {
    return self::$shapes;
  }

  public static function hasShape($key) {
    return isset(self::$shapes[$key]);
  }

  public static function getShape($key) {
    if (isset(self::$shapes[$key])) {
      return self::$shapes[$key];
    }
    throw new \Exception("Shape $key not found");
  }
}

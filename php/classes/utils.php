<?php
/**
 * Copyright (C) 2017-2023 Petr Hucik <petr@getdatakick.com>
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
 * @copyright 2017-2023 Petr Hucik
 * @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 */

namespace Revws;

use Exception;

class Utils
{

    /**
     * @param array $arr
     *
     * @return array
     */
    public static function toKeyValue($arr)
    {
        return self::mapKeyValue('@key', '@identity', $arr);
    }

    /**
     * @param string $keyField
     * @param string|callable $valueField
     * @param array $arr
     *
     * @return array
     */
    public static function mapKeyValue($keyField, $valueField, $arr)
    {
        $ret = [];
        $identity = $valueField === '@identity';
        $callback = is_callable($valueField);
        foreach ($arr as $key => $fields) {
            if ($keyField === '@key') {
                $id = (int)$key;
            } else {
                $id = $fields[$keyField];
                if (is_numeric($id)) {
                    $id = (int)$id;
                }
            }
            if ($identity) {
                $value = $fields;
            } elseif ($callback) {
                $value = call_user_func($valueField, $fields);
            } else {
                $value = $fields[$valueField];
            }
            $ret[$id] = $value;
        }
        return $ret;
    }

    /**
     * @param array $arr
     *
     * @return array
     */
    public static function toIntArray($arr)
    {
        return array_map('intval', $arr);
    }

    /**
     * @return string
     */
    public static function getMailsDirectory()
    {
        return _PS_MODULE_DIR_ . 'revws' . DIRECTORY_SEPARATOR . 'mails' . DIRECTORY_SEPARATOR;
    }

    /**
     * @param int[] $grades
     *
     * @return float|int
     */
    public static function calculateAverage($grades)
    {
        $cnt = count($grades);
        if ($cnt) {
            return array_sum($grades) / $cnt;
        }
        return 0;
    }

    /**
     * @return string
     */
    public static function getRandomData()
    {
        try {
            if (function_exists('random_bytes')) {
                return bin2hex(random_bytes(16));
            }
            if (function_exists('openssl_random_pseudo_bytes')) {
                return bin2hex(openssl_random_pseudo_bytes(16));
            }
        } catch (Exception $e) {
        }
        return bin2hex(substr(hex2bin(sha1(uniqid('rd' . rand(), true))), 0, 16));
    }
}

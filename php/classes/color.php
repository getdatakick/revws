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

class Color
{
    /**
     * @param string $color
     * @param float $coef
     *
     * @return string
     */
    public static function emphasize($color, $coef = 0.25)
    {
        if (self::isTransparent($color)) {
            return $color;
        }
        return self::getLuminance($color) > 0.5
            ? self::darken($color, $coef)
            : self::lighten($color, $coef);
    }

    /**
     * @param string $color
     *
     * @return bool
     */
    public static function isTransparent($color)
    {
        return $color == 'transparent';
    }

    /**
     * @param string $color
     *
     * @return float
     */
    public static function getLuminance($color)
    {
        $values = self::decomposeColor($color);
        $vals = [];
        foreach ($values as $val) {
            $val = $val / 255;
            $vals[] = $val <= 0.03928 ? $val / 12.92 : pow(($val + 0.055) / 1.055, 2.4);
        }
        return (0.2126 * $vals[0] + 0.7152 * $vals[1] + 0.0722 * $vals[2]);
    }

    /**
     * @param string $color
     *
     * @return int[]
     */
    public static function decomposeColor($color)
    {
        if (self::isTransparent($color)) {
            return [255, 255, 255];
        }
        return [
            hexdec(substr($color, 1, 2)),
            hexdec(substr($color, 3, 2)),
            hexdec(substr($color, 5, 2))
        ];
    }

    /**
     * @param string $color
     * @param float $coefficient
     *
     * @return string
     */
    public static function darken($color, $coefficient)
    {
        $values = [];
        foreach (self::decomposeColor($color) as $val) {
            $values[] = $val * (1 - $coefficient);
        }
        return self::toColor($values);
    }

    /**
     * @param int[] $values
     *
     * @return string
     */
    private static function toColor($values)
    {
        return '#' . dechex((int)$values[0]) . dechex((int)$values[1]) . dechex((int)$values[2]);
    }

    /**
     * @param string $color
     * @param int $coefficient
     *
     * @return string
     */
    public static function lighten($color, $coefficient)
    {
        $values = [];
        foreach (self::decomposeColor($color) as $val) {
            $values[] = $val + (255 - $val) * $coefficient;
        }
        return self::toColor($values);
    }
}

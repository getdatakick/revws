{*
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
*}
<section id="revws-section" class="page-product-box">
  <h3 class="page-product-heading">{l s='Reviews (%s)' sprintf=[$revwsTotal] mod='revws'}</h3>
  <div id="idTabRevws">
    {if $reviewsData.preferences.microdata && $reviewCount>0 && $avgGrade > 0}
    <div class="revws-hidden" itemprop="aggregateRating" itemscope itemtype="http://schema.org/AggregateRating">
      Rated <span itemprop="ratingValue">{$avgGrade|string_format:"%.2f"}</span> on the scale <span itemProp="worstRating">1</span> - <span itemprop="bestRating">5</span> based on <span itemprop="reviewCount">{$reviewCount}</span> customer reviews
    </div>
    {/if}
    {include
      file='modules/revws/views/templates/hook/widget.tpl'
      widget=$widget
      reviewList=$reviewList
      visitor=$visitor
      reviewsData=$reviewsData
    }
  </div>
</section>

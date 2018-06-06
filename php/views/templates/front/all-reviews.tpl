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
{capture name=path}
  <span class="navigation-pipe">
    {$navigationPipe}
  </span>
  <span class="navigation_page">
    {l s='Reviews' mod='revws'}
  </span>
{/capture}

<h1>{l s='Reviews' mod='revws'}</h1>
{if $reviewList.total > 0}
<div id="revws-portal-{$reviewList.id}">
  {include
    file='modules/revws/views/templates/widgets/list/list.tpl'
    reviewStyle='item-with-product'
    reviewList=$reviewList
    displayCriteria=$reviewsData.preferences.displayCriteria
    shopName=$reviewsData.shopName
    shape=$reviewsData.theme.shape
    criteria=$reviewsData.criteria
    microdata=$reviewsData.preferences.microdata
    allowPaging=true
  }
</div>
{else}
<div class="form-group">{l s='No customer reviews for the moment.' mod='revws'}</div>
{/if}
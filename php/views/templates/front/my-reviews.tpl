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
  <a href="{$link->getPageLink('my-account', true)|escape:'html':'UTF-8'}">
    {l s='My account' mod='revws'}
  </a>
  <span class="navigation-pipe">
    {$navigationPipe}
  </span>
  <span class="navigation_page">
    {l s='My reviews' mod='revws'}
  </span>
{/capture}

<div id="myreviews">
  {include
    file='modules/revws/views/templates/widgets/my-reviews/my-reviews.tpl'
    reviewsData=$reviewsData
    reviewList=$reviewList
    reviewEntities=$reviewEntities
    visitor=$visitor
  }
</div>

<nav>
  <ul class="pager">
    <li class="previous">
      <a href="{$link->getPageLink('my-account', true)|escape:'html':'UTF-8'}" title="{l s='Back to your account' mod='revws'}">&larr; {l s='Back to your account' mod='revws'}</a>
    </li>
  </ul>
</nav>

{*
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
*}
{extends file='page.tpl'}
{block name='page_content'}
{capture name=path}
  <a href="{$link->getPageLink('reviews', true)|escape:'html':'UTF-8'}">
    {l s='Reviews' mod='revws'}
  </a>
  <span class="navigation_page">
    {l s='Reviews' mod='revws'}
  </span>
{/capture}

<h1 class="page-heading">
  {l s='Reviews' mod='revws'}
</h1>

{if $reviewList.total > 0}
  {include
    file='modules/revws/views/templates/hook/widget.tpl'
    widget=$widget
    reviewList=$reviewList
    reviewEntitites=$reviewEntities
    visitor=$visitor
    reviewsData=$reviewsData
  }
{else}
<div class="form-group">{l s='No customer reviews for the moment.' mod='revws'}</div>
{/if}
{/block}

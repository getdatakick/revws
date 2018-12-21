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
{strip}
{if isset($reviewEntities[$review.entityType][$review.entityId])}
{assign "entity" $reviewEntities[$review.entityType][$review.entityId]}
<div>
  <h2 class="revws-review-entity-name">
    <a href="{$entity.url}">{$entity.name|escape:'html':'UTF-8'}</a>
  </h2>
  <div class="revws-review-with-{$review.entityType|lower}">
    <a class="revws-entity-image-wrapper" href="{$entity.url}">
      <img src="{$entity.image}" alt="{$entity.name|escape:'html':'UTF-8'}"></img>
    </a>
    <div class="revws-review-wrapper">
      {include
        file='modules/revws/views/templates/widgets/review-list/item.tpl'
        review=$review
        shopName=$shopName
        criteria=$criteria
        shape=$shape
        displayCriteria=$displayCriteria
        microdata=false
      }
    </div>
  </div>
</div>
{/strip}
{/if}

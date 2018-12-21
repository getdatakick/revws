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
<div id="revws-portal-{$widget.id}">
  {if $widget.type === 'list'}
    {include
      file='modules/revws/views/templates/widgets/review-list/list.tpl'
      reviewList=$reviewList
      reviewEntities=$reviewEntities
      reviewStyle=$widget.reviewStyle
      displayReply=$widget.displayReply
      displayCriteria=$widget.displayCriteria
      allowPaging=$widget.allowPaging
      microdata=$widget.microdata
      displayCriteria=$reviewsData.preferences.displayCriteria
      shopName=$reviewsData.shopName
      shape=$reviewsData.theme.shape
      criteria=$reviewsData.criteria
    }
  {else if $widget.type === 'myReviews'}
    {include
      file='modules/revws/views/templates/widgets/my-reviews/my-reviews.tpl'
      reviewsData=$reviewsData
      reviewList=$reviewList
      reviewEntities=$reviewEntities
      visitor=$visitor
     }
  {else if $widget.type === 'entityList'}
    {include
      file='modules/revws/views/templates/widgets/entity-review-list/entity-review-list.tpl'
      reviewsData=$reviewsData
      reviewList=$reviewList
      reviewEntities=$reviewEntities
      visitor=$visitor
      entityId=$widget.entityId
      entityType=$widget.entityType
      microdata=$widget.microdata
      allowPaging=$widget.allowPaging
    }
  {else}
    <h2>Unknown widget: {$widget.type}</h2>
  {/if}
</div>
{/strip}

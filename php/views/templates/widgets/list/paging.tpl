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
<div class="revws-paging">
  <a href="{revws::getPageUrl($reviewList, -1)}" class="revws-page-prev{if $reviewList.page == 0} revws-disabled{/if}">
    <svg width="24" height="24" focusable="false" viewBox="0 0 24 24">
      <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"></path>
    </svg>
  </a>
  <a href="{revws::getPageUrl($reviewList, 1)}" class="revws-page-next{if $reviewList.page >= $reviewList.pages-1} revws-disabled{/if}">
    <svg width="24" height="24" focusable="false" viewBox="0 0 24 24">
      <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"></path>
    </svg>
  </a>
</div>

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
    file=revws::getWidgetTemplate('list/list')
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

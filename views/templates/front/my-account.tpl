<li>
  <a href="{$link->getModuleLink('revws', 'MyReviews', array(), true)|escape:'html':'UTF-8'}" title="{l s='My reviews' mod='revws'}">
    {if $iconClass}
    <i class="{$iconClass}"></i>
    {/if}
    <span>{l s='My reviews' mod='revws'}</span>
  </a>
</li>

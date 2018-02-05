(function() {
  var tag = document.createElement('script');
  tag.src = window.revwsData.appJsUrl;
  tag.setAttribute('defer', '');
  tag.setAttribute('async', '');
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  /**
   * this function will not work on all themes. Change it if you use tabs,
   * and reviews tab will not open automatically when you click on 'read reviews'
   */
  var openTab = function() {
    $('*[id^="idTab"]').addClass('block_hidden_only_for_screen');
    $('#idTabRevws').removeClass('block_hidden_only_for_screen');
    $('a[href^="#idTab"]').removeClass('selected');
    $('a[href="#idTabRevws"]').addClass('selected');
  };

  // watch changes in hash and open tab if necesseary
  var hashchange = function() {
    if (window.location.hash.indexOf('#idTabRevws') > -1) {
      openTab();
    }
  };
  $(window).on('hashchange', hashchange);

  $(function() {
    hashchange();
    $('a[href=#idTabRevws]').click(openTab);
    $('[data-revws-create-trigger]').click(function(e) {
      e.preventDefault();
      if (window.revws) {
        var productId = parseInt($(this).data('revws-create-trigger'), 10);
        window.revws({
          type: 'TRIGGER_CREATE_REVIEW',
          productId: productId
        })
      }
    });
  })
})();

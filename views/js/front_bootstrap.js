(function() {
  var tag = document.createElement('script');
  tag.src = window.revwsData.appJsUrl;
  tag.setAttribute('defer', '');
  tag.setAttribute('async', '');
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // returns true, if reviews are displayed in tab.
  var displayedInTab = function() {
    return (window.revwsData && window.revwsData.preferences.placement === 'tab');
  }

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

  var scrollToReviews = function() {
    if (displayedInTab()) {
      openTab();
    }
    $('html, body').animate({
      scrollTop: $("#idTabRevws").offset().top - 80
    }, 500);
  }

  $(function() {
    var s = window.location.search || '';
    if (s.indexOf('show=reviews') > -1) {
      scrollToReviews();
    }
    $('a[href=#idTabRevws]').click(function(e) {
      e.preventDefault();
      scrollToReviews();
    });
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

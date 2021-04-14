(function ($) {
  "use strict";

  $(window).on("load", function () {
    /*
    On + button click add row to table- main form
  */
    $("#table-add-col").click(function () {
      var markup = `<tr>
                    <td>#</td>
                    <td><input
                        type="text"
                        class="form-control"
                        name="object"
                        placeholder="Enter object here"
                      /></td>
                    <td>
                      <input
                        type="text"
                        class="form-control"
                        name="brand"
                        placeholder="Enter brand name here"
                      />
                    </td>
                    <td style="width: 21%;">
                      <input
                        type="file"
                        class="form-control"
                        name="image"
                      />
                    </td>
                    <td>
                        <a
                        type="button"
                        href="edit-goods-content.html"
                        class="btn btn-common btn-nv-sty"
                        
                        >Edit</a>
                        <button
                            type="button"
                            href=""
                            class="btn btn-common btn-nv-sty"
                            onclick="$(this).parent().parent().remove()">Remove</button>
                    </td>
                </tr>`;

      $(this).parent().siblings("#table-goods").append(markup);
    });

    /*
    On + button click add row to table- sub form
  */
    $("#table-content-add-col-scs").click(function () {
      var markup = `<tr>
                  <td>#</td>
                  <td><input
                        type="text"
                        class="form-control"
                        name="object"
                        placeholder="Enter object here"
                      /></td>
                  <td><input
                       type="text"
                       class="form-control"
                       name="object"
                       placeholder="Enter object here"
                      /></td>
                  <td>
                    <input
                          type="file"
                          class="form-control"
                          name="uploadfile"
                        />
                  </td>
                  <td>
                      
                      <button
                          type="button"
                          href=""
                          class="btn btn-common btn-nv-sty"
                          onclick="$(this).parent().parent().remove()">Delete</button>
                  </td>
              </tr>`;

      $(this).parent().siblings("#table-contents").append(markup);
    });

    
    $("#table-content-add-col-sts").click(function () {
      var markup = `<tr>
                  <td>#</td>
                  <td><input
                        type="text"
                        class="form-control"
                        name="object"
                        placeholder="Enter object here"
                      /></td>
                  <td>
                    <input
                          type="file"
                          class="form-control"
                          name="uploadfile"
                        />
                  </td>
                  <td>
                      
                      <button
                          type="button"
                          href=""
                          class="btn btn-common btn-nv-sty"
                          onclick="$(this).parent().parent().remove()">Delete</button>
                  </td>
              </tr>`;

      $(this).parent().siblings("#table-contents").append(markup);
    });

    $("#table-content-add-col").click(function () {
      var markup = `<tr>
                  <td>#</td>
                  <td><input
                        type="text"
                        class="form-control"
                        name="object"
                        placeholder="Enter object here"
                      /></td>
                  <td><input
                       type="text"
                       class="form-control"
                       name="object"
                       placeholder="Enter object here"
                      /></td>
                  <td>
                    <!--<span class="btn btn-common btn-nv-sty">
                        Browse <input 
                        type="file" 
                        style="
                        position: absolute !important;
                        top: 0;
                        text-align: right;
                        filter: alpha(opacity=0);
                        opacity: 0;
                        outline: none;   
                        cursor: inherit;
                        display: block;">
                    </span>-->
                    <input
                          type="file"
                          class="form-control"
                          name="uploadfile"
                        />
                  </td>
                  <td>
                      
                      <button
                          type="button"
                          href=""
                          class="btn btn-common btn-nv-sty"
                          onclick="$(this).parent().parent().remove()">Delete</button>
                  </td>
              </tr>`;

      $(this).parent().siblings("#table-contents").append(markup);
    });

    /*Page Loader active
    ========================================================*/
    $("#preloader").fadeOut();

    // Sticky Nav
    $(window).on("scroll", function () {
      if ($(window).scrollTop() > 200) {
        $(".scrolling-navbar").addClass("top-nav-collapse");
      } else {
        $(".scrolling-navbar").removeClass("top-nav-collapse");
      }
    });

    /* ==========================================================================
       countdown timer
       ========================================================================== */
    jQuery("#clock").countdown("2020/08/05", function (event) {
      var $this = jQuery(this).html(
        event.strftime(
          "" +
            '<div class="time-entry days"><span>%-D</span> Days</div> ' +
            '<div class="time-entry hours"><span>%H</span> Hours</div> ' +
            '<div class="time-entry minutes"><span>%M</span> Minutes</div> ' +
            '<div class="time-entry seconds"><span>%S</span> Seconds</div> '
        )
      );
    });

    /* slicknav mobile menu active  */
    $(".mobile-menu").slicknav({
      prependTo: ".navbar-header",
      parentTag: "liner",
      allowParentLinks: true,
      duplicate: true,
      label: "",
    });

    /* WOW Scroll Spy
    ========================================================*/
    var wow = new WOW({
      //disabled for mobile
      mobile: false,
    });
    wow.init();

    /* Nivo Lightbox 
    ========================================================*/
    $(".lightbox").nivoLightbox({
      effect: "fadeScale",
      keyboardNav: true,
    });

    // one page navigation
    $(".navbar-nav").onePageNav({
      currentClass: "active",
    });

    /* Back Top Link active
    ========================================================*/
    var offset = 200;
    var duration = 500;
    $(window).scroll(function () {
      if ($(this).scrollTop() > offset) {
        $(".back-to-top").fadeIn(400);
      } else {
        $(".back-to-top").fadeOut(400);
      }
    });

    $(".back-to-top").on("click", function (event) {
      event.preventDefault();
      $("html, body").animate(
        {
          scrollTop: 0,
        },
        600
      );
      return false;
    });
  });
})(jQuery);

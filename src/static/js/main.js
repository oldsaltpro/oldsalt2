---
---

/*
	Tip: You can use Jekyll's include or include_relative
	tag to include Javascript files.
*/

// Enter your JS code here/*
(function ($) {

    skel.breakpoints({
        xlarge: '(max-width: 1680px)',
        large: '(max-width: 1280px)',
        medium: '(max-width: 980px)',
        small: '(max-width: 736px)',
        xsmall: '(max-width: 480px)'
    });

    $(function () {

        var $window = $(window),
            $body = $('body'),
            $wrapper = $('#wrapper');

        // Hack: Enable IE workarounds.
        if (skel.vars.IEVersion < 12)
            $body.addClass('ie');

        // Touch?
        if (skel.vars.mobile)
            $body.addClass('touch');

        // Transitions supported?
        if (skel.canUse('transition')) {

            // Add (and later, on load, remove) "loading" class.
            $body.addClass('loading');

            $window.on('load', function () {
                window.setTimeout(function () {
                    $body.removeClass('loading');
                }, 100);
            });

            // Prevent transitions/animations on resize.
            var resizeTimeout;

            $window.on('resize', function () {

                window.clearTimeout(resizeTimeout);

                $body.addClass('resizing');

                resizeTimeout = window.setTimeout(function () {
                    $body.removeClass('resizing');
                }, 100);

            });

        }

        // Scroll back to top.
        $window.scrollTop(0);

        // Fix: Placeholder polyfill.
        $('form').placeholder();

        // Panels.
        var $panels = $('.panel');

        $panels.each(function () {

            var $this = $(this),
                $toggles = $('[href="#' + $this.attr('id') + '"]'),
                $closer = $('<div class="closer" />').appendTo($this);

            // Closer.
            $closer
                .on('click', function (event) {
                    $this.trigger('---hide');
                });

            // Events.
            $this
                .on('click', function (event) {
                    event.stopPropagation();
                })
                .on('---toggle', function () {

                    if ($this.hasClass('active'))
                        $this.triggerHandler('---hide');
                    else
                        $this.triggerHandler('---show');

                })
                .on('---show', function () {

                    // Hide other content.
                    if ($body.hasClass('content-active'))
                        $panels.trigger('---hide');

                    // Activate content, toggles.
                    $this.addClass('active');
                    $toggles.addClass('active');

                    // Activate body.
                    $body.addClass('content-active');

                })
                .on('---hide', function () {

                    // Deactivate content, toggles.
                    $this.removeClass('active');
                    $toggles.removeClass('active');

                    // Deactivate body.
                    $body.removeClass('content-active');

                });

            // Toggles.
            $toggles
                .removeAttr('href')
                .css('cursor', 'pointer')
                .on('click', function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    $this.trigger('---toggle');

                });

        });

        // Global events.
        $body
            .on('click', function (event) {

                if ($body.hasClass('content-active')) {

                    event.preventDefault();
                    event.stopPropagation();

                    $panels.trigger('---hide');

                }

            });

        $window
            .on('keyup', function (event) {

                if (event.keyCode == 27
                    && $body.hasClass('content-active')) {

                    event.preventDefault();
                    event.stopPropagation();

                    $panels.trigger('---hide');

                }

            });

        // Header.
        var $header = $('#header');

        // Links.
        $header.find('a').each(function () {

            var $this = $(this),
                href = $this.attr('href');

            // Internal link? Skip.
            if (!href
                || href.charAt(0) == '#')
                return;

            // Redirect on click.
            $this
                .removeAttr('href')
                .css('cursor', 'pointer')
                .on('click', function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    window.location.href = href;

                });

        });

        // Footer.
        var $footer = $('#footer');

        // Copyright.
        // This basically just moves the copyright line to the end of the *last* sibling of its current parent
        // when the "medium" breakpoint activates, and moves it back when it deactivates.
        $footer.find('.copyright').each(function () {

            var $this = $(this),
                $parent = $this.parent(),
                $lastParent = $parent.parent().children().last();

            skel
                .on('+medium', function () {
                    $this.appendTo($lastParent);
                })
                .on('-medium', function () {
                    $this.appendTo($parent);
                });

        });

        // Main.
        var $main = $('#main'),
            exifDatas = {};

        // Thumbs.
        $main.children('.thumb').each(function () {

            var $this = $(this),
                $image = $this.find('.image'), $image_img = $image.children('img'),
                x;

            // No image? Bail.
            if ($image.length == 0)
                return;

            // Image.
            // This sets the background of the "image" <span> to the image pointed to by its child
            // <img> (which is then hidden). Gives us way more flexibility.

            // Set background.
            $image.css('background-image', 'url(' + $image_img.attr('src') + ')');

            // Set background position.
            if (x = $image_img.data('position'))
                $image.css('background-position', x);

            // Hide original img.
            // $image_img.hide();

            // Hack: IE<11 doesn't support pointer-events, which means clicks to our image never
            // land as they're blocked by the thumbnail's caption overlay gradient. This just forces
            // the click through to the image.
            if (skel.vars.IEVersion < 11)
                $this
                    .css('cursor', 'pointer')
                    .on('click', function () {
                        $image.trigger('click');
                    });

            // EXIF data					
            EXIF.getData($image_img[0], function () {
                exifDatas[$image_img.data('name')] = getExifDataMarkup(this);
            });

        });

        // Poptrox.
        $main.poptrox({
            baseZIndex: 20000,
            caption: function ($a) {
                var $image_img = $a.children('img');
                var data = exifDatas[$image_img.data('name')];
                if (data === undefined) {
                    // EXIF data					
                    EXIF.getData($image_img[0], function () {
                        data = exifDatas[$image_img.data('name')] = getExifDataMarkup(this);
                    });
                }
                return data !== undefined ? '<p>' + data + '</p>' : ' ';
            },
            fadeSpeed: 300,
            onPopupClose: function () {
                $body.removeClass('modal-active');
            },
            onPopupOpen: function () {
                $body.addClass('modal-active');
            },
            overlayOpacity: 0,
            popupCloserText: '',
            popupHeight: 100,
            popupLoaderText: '',
            popupSpeed: 300,
            popupWidth: 150,
            selector: '.thumb > a.image',
            usePopupCaption: true,
            usePopupCloser: true,
            usePopupDefaultStyling: false,
            usePopupForceClose: true,
            usePopupLoader: true,
            usePopupNav: true,
            windowMargin: 50
        });

        // Hack: Set margins to 0 when 'xsmall' activates.
        skel
            .on('-xsmall', function () {
                $main[0]._poptrox.windowMargin = 50;
            })
            .on('+xsmall', function () {
                $main[0]._poptrox.windowMargin = 0;
            });

        function getExifDataMarkup(img) {
            var exif = fetchExifData(img);
            var template = '';
            for (var info in exif) {
                if (info === "model") {
                    template += '<i class="fa fa-camera-retro" aria-hidden="true"></i> ' + exif["model"] + '&nbsp;&nbsp;';
                }
                if (info === "aperture") {
                    template += '<i class="fa fa-dot-circle-o" aria-hidden="true"></i> f/' + exif["aperture"] + '&nbsp;&nbsp;';
                }
                if (info === "shutter_speed") {
                    template += '<i class="fa fa-clock-o" aria-hidden="true"></i> ' + exif["shutter_speed"] + '&nbsp;&nbsp;';
                }
                if (info === "iso") {
                    template += '<i class="fa fa-info-circle" aria-hidden="true"></i> ' + exif["iso"] + '&nbsp;&nbsp;';
                }
            }
            return template;
        }

        function fetchExifData(img) {
            var exifData = {};

            if (EXIF.getTag(img, "Model") !== undefined) {
                exifData.model = EXIF.getTag(img, "Model");
            }

            if (EXIF.getTag(img, "FNumber") !== undefined) {
                exifData.aperture = EXIF.getTag(img, "FNumber");
            }

            if (EXIF.getTag(img, "ExposureTime") !== undefined) {
                exifData.shutter_speed = EXIF.getTag(img, "ExposureTime");
            }

            if (EXIF.getTag(img, "ISOSpeedRatings") !== undefined) {
                exifData.iso = EXIF.getTag(img, "ISOSpeedRatings");
            }
            return exifData;
        }

    });

    // - 4way Directional Hover (Fork of https://codepen.io/jsnchn/pen/nqcHe)

    var mX, mY;
    $(document).mousemove(function (e) {
        /*mouse position respective to the document*/
        mX = e.pageX;
        mY = e.pageY;
    });
    function calcDir(elem) {
        /*get mouse coords relative to the center of the element*/
        var rX = ((mX - elem.offset().left)) - (elem.width() / 2);
        var rY = ((mY - elem.offset().top)) - (elem.height() / 2);
        console.log(rX + ',' + rY);
        /*determine direction for horizontal and vertical axis*/
        var hdir = rX > 0 ? 'r' : 'l';
        var vdir = rY > 0 ? 'b' : 't';
        var dir = '';
        /*how much variance in entry/exit?*/
        if (Math.abs(rX) > Math.abs(rY)) { dir = hdir; }
        else { dir = vdir; }
        return dir;
    }
    /*entry point*/
    $('.da-aware').mouseenter(function () {
        this.className = this.className.replace(/\w*-in(\b|$)/, "");
        this.className = this.className.replace(/\w*-out(\b|$)/, "");
        $(this).addClass(calcDir($(this)) + '-in');
    });
    /*exit point*/
    $('.da-aware').mouseleave(function () {
        $(this).addClass(calcDir($(this)) + '-out');
    });

})(jQuery);

// - Get Average Image Color (Fork of https://codepen.io/anonymusic/pen/NNYvNY )
getAverageRGB($('a.image'));
console.log($('a.image').length);
function getAverageRGB() {
    arguments[0].each(function () {
        var image = new Image(), _this = $(this);
        image.crossOrigin = 'anonymous';
        image.src = _this.css('background-image').split('("')[1].split('")')[0];
        image.height = _this.height();
        image.width = _this.width();
        image.onload = function () {
            var blockSize = 40, defaultRGB = {
                r: 65,
                g: 65,
                b: 65
            }, // for non-supporting envs 
                canvas = document.createElement('canvas'), context = canvas.getContext && canvas.getContext('2d'), data, width, height, i = -4, length, rgb = defaultRGB, count = 0;
            if (!context) {
                return defaultRGB;
            }
            height = canvas.height = image.naturalHeight || image.offsetHeight || image.height;
            width = canvas.width = image.naturalWidth || image.offsetWidth || image.width;
            context.drawImage(image, 390, 270, 470, 450, 0, 0, height, width);
            try {
                data = context.getImageData(0, 0, width, height);
            }
            catch (e) {
                console.log(e);
                return defaultRGB;
            }
            length = data.data.length;
            while ((i += blockSize * 4) < length) {
                ++count;
                rgb.r += data.data[i];
                rgb.g += data.data[i + 1];
                rgb.b += data.data[i + 2];
                if ((i += blockSize * 4) < length) {
                    break;
                }
            }
            // ~~ used to floor values
            rgb.r = ~~(Math.abs(rgb.r / count - 50));
            rgb.g = ~~(Math.abs(rgb.g / count - 50));
            rgb.b = ~~(Math.abs(rgb.b / count - 50));
            var rgbaString = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.4)';
            var rgbaStringBold = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 1)';
            _this.siblings('.da-overlay').css({ 'background-color': rgbaString });
        };
    });
}

/*
  Embed should work by this
  <div>
    <script src="http://localhost:3001/runtime/embed.js" FP_ID="7"></script>
  </div>

  => 

  <div>
    <script src="http://localhost:3001/runtime/embed.js" FP_ID="7"></script>
    <iframe src="http://localhost:3001/form/view/7"/>
  </div>
  
  1. DON't depend on BACKEND, parse it from src part of script tags who has FP_ID attribute defined

  2. traverse FP_ID defined script tags, and insert iframe form view just as sibling


*/

;(async () => {
  const scriptUrl = document.querySelectorAll('[fp_id]')[0].src
  const arr = scriptUrl.split('/')
  const BACKEND = arr[0] + '//' + arr[2]

  const loadScript = (name) =>
    new Promise((resolve, reject) => {
      const script = document.createElement('script')

      script.onload = resolve
      script.src = `${BACKEND}/runtime/${name}.js`
      document.head.appendChild(script)
    })

  await loadScript('3rdparty/jquery.3.4.1.min')
  await loadScript('3rdparty/iframeResizer.min')
  // console.log(jQuery('script a'))

  // add iframe after script tag, adding after not fp_style to ignore multiple embed
  $('script[fp_id]').each(function (index, elem) {
    const formID = $(this).attr('fp_id')
    const iframeID = 'fp_' + formID

    let iframeElem = `<iframe id="${iframeID}" src="${BACKEND}/form/view/${formID}?embed=true"></iframe>`

    if ($(this).attr('fp_widget') !== undefined) {
      iframeElem = `
      <div style="position: fixed; bottom: 30px; left: 30px;">
        <div class="message-container hidden">
          <h2>We're not here, drop us an email...</h2>
          <div class="iframe-content">
            <iframe id="${iframeID}" src="${BACKEND}/form/view/${formID}?embed=true&widget=true" crossorigin="anonymous" onload="at()"></iframe>
          </div>
        </div>
        <div class="button-container">
          <img src="https://static.formpress.org/images/embed-chat.svg" class="icon chat" onClick="toggleOpen(true)">
          <img src="https://static.formpress.org/images/embed-cross.svg" class="icon cross hidden" onClick="toggleOpen(false)">
        </div>
      </div>
      `
    }

    if (!$(this).next().attr('fp_style')) {
      if ($(this).attr('fp_widget') === undefined) {
        $(`<style fp_style="true">
          iframe {
            width: 1px;
            min-width: 100%;
            border: none;
          }
        </style>
        <script>
          iFrameResize({ log: false }, '#${iframeID}')
        </script>`).insertAfter(this)
      } else {
        $(`<style fp_style="true">
        iframe {
          width: 1px;
          min-width: 100%;
          border: none;
        }
        .icon {
          cursor: pointer;
          width: 70%;
          position: absolute;
          top: 9px;
          left: 9px;
          transition: transform .3s ease;
        }
        .hidden {
          transform: scale(0);
        }
        .button-container {
          background-color: #04b73f;
          width: 60px;
          height: 60px;
          border-radius: 50%;
        }
        .message-container {
          box-shadow: 0 0 18px 8px rgba(0, 0, 0, 0.1), 0 0 32px 32px rgba(0, 0, 0, 0.08);
          width: 400px;
          /*right: -25px;*/
          bottom: 75px;
          max-height: 400px;
          position: absolute;
          transition: max-height .2s ease;
          font-family: Helvetica, Arial ,sans-serif;
          overflow: scroll;
        }
        .message-container.hidden {
          max-height: 0px;
        }
        .message-container h2 {
          margin: 0;
          padding: 20px 20px;
          color: #fff;
          background-color: #04b73f;
        }
        .message-container .iframe-content {
          margin: 20px 10px ;
          border: 1px solid #dbdbdb;
          padding: 10px;
          display: flex;
          background-color: #fff;
          flex-direction: column;
        }
        .message-container form * {
          margin: 5px 0;
        }
        .message-container form input {
          padding: 10px;
        }
        .message-container form textarea {
          height: 100px;
          padding: 10px;
        }
        .message-container form textarea::placeholder {
          font-family: Helvetica, Arial ,sans-serif;
        }
        .message-container form button {
          cursor: pointer;
          background-color: #04b73f;
          color: #fff;
          border: 0;
          border-radius: 4px;
          padding: 10px;
        }
        .message-container form button:hover {
          background-color: #16632f;
        }
      </style>
      ${iframeElem}
      <script>
        if(getCookie('fp_widget_cookie') !== ""){
          iframeElem = '<div class="iframe-content">No you are fucking not</div>';
        }
        var open = true
        function toggleOpen(open) {
          if (open) {
            $('.chat').addClass('hidden');
            $('.cross').removeClass('hidden');
            $('.message-container').removeClass('hidden');
          } else {
            $('.chat').removeClass('hidden');
            $('.cross').addClass('hidden');
            $('.message-container').addClass('hidden');
          }
        }
        function getCookie(cname) {
          let name = cname + "=";
          let ca = document.cookie.split(';');
          for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
              c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
            }
          }
          return "";
        }
        function at(){
          console.log(document.getElementsByTagName('iframe')[0].contentWindow.document.body.innerText);
        }
        iFrameResize({ log: false }, '#${iframeID}')
      </script>`).insertAfter(this)
      }
    }
  })
})()

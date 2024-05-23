import { Application } from "../../../main/javascript/runtime/appl/appl.js";

var SampleApp = function(_cxt, div, baseuri) {
    Application.call(this, _cxt, div, baseuri);
    this.title = 'Sample';
    return ;
}

SampleApp.prototype = new Application();
SampleApp.prototype.constructor = SampleApp;

var SampleCard = function() {
    // This is really a placeholder, but copy whatever may be needed to get this to pass ...
}

// from the downAgain routing system test
var downagainMap = function() {
    return {
      secure: false,
      cards: [
        { name: 'main', card: /* test__golden.Root */ SampleCard}
      ],
      enter: [
        { card: 'main', contract: 'Lifecycle', action: 'load', args: [{ str: 'loaded' }] }
      ],
      at: [
      ],
      exit: [
        { card: 'main', contract: 'Lifecycle', action: 'done', args: [] }
      ],
      routes: [
        {
          path: 'home', 
          secure: false,
          cards: [
            { name: 'home', card: /* test__golden.Home */ SampleCard }
          ],
          enter: [
            { card: 'home', contract: 'Lifecycle', action: 'load', args: [{ str: 'at home' }] },
            { card: 'main', contract: 'Lifecycle', action: 'nest', args: [{ ref: 'home' }] }
          ],
          at: [
          ],
          exit: [
          ],
          routes: [
            {
              path: 'settings', 
              secure: false,
              cards: [
                { name: 'settings', card: /* test__golden.Settings */ SampleCard }
              ],
              enter: [
                { card: 'settings', contract: 'Lifecycle', action: 'load', args: [{ str: 'in settings' }] },
                { card: 'main', contract: 'Lifecycle', action: 'nest', args: [{ ref: 'settings' }] }
              ],
              at: [
              ],
              exit: [
              ],
              routes: [
              ]
            }
          ]
        }
      ]
    };
  };

// modified from the params routing system test to also have a simple static route AND a static/param route
var paramsMap = function() {
    return {
      secure: false,
      cards: [
      { name: 'main', card: /* test__golden.Home */ SampleCard}
      ],
      enter: [
      ],
      at: [
      ],
      exit: [
      ],
      routes: [
        {
            path: 'settings', 
            secure: false,
            cards: [
              { name: 'settings', card: /* test__golden.Settings */ SampleCard }
            ],
            enter: [
              { card: 'settings', contract: 'Lifecycle', action: 'load', args: [{ str: 'in settings' }] },
              { card: 'main', contract: 'Lifecycle', action: 'nest', args: [{ ref: 'settings' }] }
            ],
            at: [
            ],
            exit: [
            ],
            routes: [
            ]
        },
        {
            path: 'history', 
            secure: false,
            cards: [
              { name: 'settings', card: /* test__golden.Settings */ SampleCard }
            ],
            enter: [
              { card: 'settings', contract: 'Lifecycle', action: 'load', args: [{ str: 'in settings' }] },
              { card: 'main', contract: 'Lifecycle', action: 'nest', args: [{ ref: 'settings' }] }
            ],
            at: [
            ],
            exit: [
            ],
            routes: [
                {
                    param: 'from', 
                    secure: false,
                    cards: [
            
                    ],
                    enter: [
                      { card: 'main', contract: 'Lifecycle', action: 'load', args: [{ param: 'from' }] }
                    ],
                    at: [
                    ],
                    exit: [
                    ],
                    routes: [
                    ]
                  }
            ]
        },
        {
          param: 'thing', 
          secure: false,
          cards: [
  
          ],
          enter: [
            { card: 'main', contract: 'Lifecycle', action: 'load', args: [{ param: 'thing' }] }
          ],
          at: [
          ],
          exit: [
          ],
          routes: [
          ]
        }
      ]
    };
  };
    

var queryMap = function() {
  return {
    secure: false,
    cards: [
      { name: 'main', card: /* test__golden.Home */ SampleCard }
    ],
    enter: [
      { card: 'main', contract: 'Lifecycle', action: 'query', args: [{ str: 'arg' }] }
    ],
    at: [
    ],
    exit: [
    ],
    routes: [
    ]
  };
};

export { SampleApp, downagainMap, paramsMap, queryMap };
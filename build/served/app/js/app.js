var app, modelDefs, types,
  __hasProp = {}.hasOwnProperty;

app = angular.module('piechopper', ['ui', 'ui.bootstrap', 'ngSanitize']);

modelDefs = {
  all: [],
  add: function(newDef) {
    var i, oldDef, _i, _len, _ref;
    _ref = modelDefs.all;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      oldDef = _ref[i];
      if (newDef.priority < oldDef.priority) {
        modelDefs.all.splice(i, 0, newDef);
        newDef = null;
        break;
      }
    }
    if (newDef) {
      return modelDefs.all.push(newDef);
    }
  }
};

types = {
  checkbox: function(options) {
    return {
      typeName: 'checkbox',
      "default": (options != null ? options["default"] : void 0) || false,
      check: function(value) {
        if (typeof value !== 'boolean') {
          return 'Value must be on / off';
        }
      }
    };
  },
  radio: function(options) {
    return {
      typeName: 'radio',
      "default": false,
      check: function(value) {
        if (typeof value !== 'boolean') {
          return 'Value must be on / off';
        }
      }
    };
  },
  number: function(options) {
    return {
      typeName: 'number',
      "default": options["default"] || 0,
      min: options != null ? options.min : void 0,
      max: options != null ? options.max : void 0,
      unit: options != null ? options.unit : void 0,
      check: function(value) {
        if (typeof value !== 'number') {
          return 'Value must be a number';
        }
        if ((options != null ? options.min : void 0) && value < options.min) {
          return "Value must be bigger than " + options.min;
        }
        if ((options != null ? options.max : void 0) && value > options.max) {
          return "Value must be smaller than " + options.max;
        }
      }
    };
  },
  "enum": function(options) {
    var k, r, v;
    r = {
      typeName: 'enum',
      values: options.values,
      "default": options["default"],
      check: function(value) {
        var found, k, v, _ref;
        found = false;
        _ref = options.values;
        for (k in _ref) {
          if (!__hasProp.call(_ref, k)) continue;
          v = _ref[k];
          if (value === v) {
            found = true;
          }
        }
        if (!found) {
          return "Value must be one of " + options.values;
        }
      }
    };
    if (r["default"] === void 0) {
      r["default"] = ((function() {
        var _i, _len, _ref, _results;
        _ref = options.values;
        _results = [];
        for (v = _i = 0, _len = _ref.length; _i < _len; v = ++_i) {
          k = _ref[v];
          _results.push(v);
        }
        return _results;
      })())[0];
    }
    return r;
  }
};

var _this = this;

app.controller("AppCtrl", function($scope, $location, $http, $modal, $window, modelRepo, trace) {
  var addDefaultMembers, members, model, pathParts, repo, showInvalidProposalError, showUnknownProposalError, uuid, _linkToSnapshot;
  uuid = function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r, v;
      r = Math.random() * 16 | 0;
      v = (c === "x" ? r : r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  if (!localStorage.userId) {
    localStorage.userId = uuid();
  }
  $scope.userId = localStorage.userId;
  $scope.repo = repo = modelRepo.createRepo(modelDefs.all);
  $scope.model = model = function() {
    return repo.activeModel;
  };
  $scope.members = members = function() {
    return repo.activeModel.team.members;
  };
  $scope.criteria = function(id) {
    return repo.activeModel.modelDef.criterias[id];
  };
  $scope.memberColors = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c"];
  $scope.trace = trace;
  $scope.moreResultsWanted = false;
  $scope.showMoreResults = function(show) {
    return $scope.moreResultsWanted = show;
  };
  _linkToSnapshot = null;
  $scope.linkToSnapshot = function(val) {
    if (val !== void 0) {
      _linkToSnapshot = val;
    }
    return _linkToSnapshot;
  };
  $scope.showMessage = function(title, desc, timeout) {
    var dlg, html;
    html = "<div class=\"error-dlg\">\n  <h2>" + title + "</h2>\n  <d>" + desc + "</d>\n</div>";
    dlg = $modal.open({
      template: html
    });
    if (timeout) {
      return $timeout((function() {
        return dlg.dismiss();
      }), timeout);
    }
  };
  $scope.showTos = function() {
    $scope.showMessage("Terms and Conditions", $('#tos').html());
    return $scope.trace.showTos();
  };
  showUnknownProposalError = function() {
    return $scope.showMessage('Oops !', "<p>The proposal you were looking for wasn't found.</p>\n<p>\n  Please note that proposals older than a month are deleted.\n  For more recent proposals, please check that your address is correct.\n</p>");
  };
  showInvalidProposalError = function() {
    return $scope.showMessage('Ooops !', "<p>\n  There was an error while loading the given address.\n  Some parts of the proposal might not be correct!\n</p>\n<p>\n  If your data is mission critical, mail to info@piechopper.com.\n</p>");
  };
  addDefaultMembers = function() {
    var _i, _results;
    _results = [];
    for (_i = 1; _i <= 2; _i++) {
      _results.push(repo.addMember());
    }
    return _results;
  };
  pathParts = $location.path().split('/');
  if (pathParts.length === 3 && pathParts[1] === 'p') {
    return $http.get("/api/1/proposals/" + pathParts[2]).success(function(data, status, headers, config) {
      var success;
      success = repo.deserialize(data.repo);
      if (!success) {
        showInvalidProposalError();
      } else {
        $scope.$broadcast('modelLoaded');
      }
      if (data.userId && (data.userId === $scope.userId)) {
        return $scope.trace.loadOwnProposal();
      } else {
        return $scope.trace.loadPartnerProposal();
      }
    }).error(function(data, status, headers, config) {
      addDefaultMembers();
      return showUnknownProposalError();
    });
  } else if (pathParts.length >= 2) {
    addDefaultMembers();
    return showUnknownProposalError();
  } else {
    return addDefaultMembers();
  }
});

app.controller("CalcCtrl", function($scope, $timeout, trace) {
  var score, scoreTimer, syncMemberNames, updateEquities;
  updateEquities = function() {
    var m, _i, _len, _ref, _results;
    $scope.equities = [];
    _ref = $scope.members();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      m = _ref[_i];
      _results.push($scope.equities.push({
        name: m.name,
        value: m.equity
      }));
    }
    return _results;
  };
  $scope.memberValues = function() {
    var m, _i, _len, _ref, _results;
    _ref = $scope.members();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      m = _ref[_i];
      _results.push(m.values);
    }
    return _results;
  };
  scoreTimer = null;
  score = function() {
    var doScore;
    $scope.linkToSnapshot(null);
    if (scoreTimer) {
      $timeout.cancel(scoreTimer);
    }
    doScore = function() {
      $scope.model().score();
      return updateEquities();
    };
    return scoreTimer = $timeout(doScore, 1);
  };
  $scope.$watch('memberValues()', score, true);
  $scope.$watch('model().emphasis', score, true);
  syncMemberNames = function() {
    $scope.repo.syncMemberNames($scope.model());
    return updateEquities();
  };
  $scope.memberNames = function() {
    var m, _i, _len, _ref, _results;
    _ref = $scope.members();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      m = _ref[_i];
      _results.push(m.name);
    }
    return _results;
  };
  $scope.$watch('memberNames()', syncMemberNames, true);
  return $scope.unselectOtherRadios = function(id, member) {
    return $timeout(function() {
      var other, _i, _len, _ref, _results;
      if (member.values[id]) {
        _ref = $scope.members();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          other = _ref[_i];
          if (other.id !== member.id) {
            _results.push(other.values[id] = false);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    }, 1);
  };
});

app.controller("HeaderCtrl", function($scope) {
  return $scope.aboutVisible = false;
});

app.controller("ModelSelectionCtrl", function($scope, $timeout) {
  var Slide, m, onSlideChange, slide, slideChangeTimer, slides, _i, _len, _ref;
  Slide = (function() {
    function Slide(model, id, active, name, image, target, desc) {
      this.model = model;
      this.id = id;
      this.active = active;
      this.name = name;
      this.image = image;
      this.target = target;
      this.desc = desc;
    }

    return Slide;

  })();
  $scope.slides = slides = [];
  _ref = $scope.repo.models;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    m = _ref[_i];
    slide = new Slide(m, m.modelDef.id, m.active, m.modelDef.name, m.modelDef.image, m.modelDef.target, m.modelDef.desc);
    slides.push(slide);
  }
  slideChangeTimer = null;
  onSlideChange = function() {
    if (slideChangeTimer) {
      $timeout.cancel(slideChangeTimer);
    }
    return slideChangeTimer = $timeout(function() {
      $scope.repo.activeModel = $scope.activeSlide().model;
      return console.log("in onSlideChange timed", $scope.repo.activeModel.modelDef.name);
    }, 1000);
  };
  $scope.activeSlide = function() {
    var s, _j, _len1;
    for (_j = 0, _len1 = slides.length; _j < _len1; _j++) {
      s = slides[_j];
      if (s.active) {
        return s;
      }
    }
  };
  $scope.$on('modelLoaded', function() {
    var model, s, _j, _len1, _results;
    model = $scope.repo.activeModel;
    console.log("in modelLoaded", model.modelDef.name);
    if (slideChangeTimer) {
      $timeout.cancel(slideChangeTimer);
    }
    _results = [];
    for (_j = 0, _len1 = slides.length; _j < _len1; _j++) {
      s = slides[_j];
      _results.push(s.active = s.model === model);
    }
    return _results;
  });
  return $scope.$watch($scope.activeSlide, onSlideChange);
});

app.controller("QuestionaryCtrl", function($scope, $http, $timeout, $rootScope) {
  $scope.questionary = {};
  $scope.questionarySent = false;
  return $scope.sendQuestionary = function() {
    var doc;
    $scope.trace.sendQuestionary();
    doc = {
      userId: $scope.userId,
      questionary: $scope.questionary
    };
    return $http.post('/api/1/questionaries', doc).success(function(data, status, headers, config) {
      return $scope.questionarySent = true;
    }).error(function(data, status, headers, config) {
      return $scope.showMessage('Oops !', "There was an error while saving the questionary.\n<ul>\n  <li>Please check that your internet connection works.</li>\n  <li>If it works, there might be a problem with the service. Sorry about the situation!</li>\n</ul>");
    });
  };
});

app.controller("ShareCtrl", function($scope, $http, $location) {
  $scope.linkToSnapshot(null);
  return $scope.saveSnapshot = function() {
    var doc;
    doc = {
      repo: $scope.repo.serialize(),
      userId: $scope.userId
    };
    return $http.post('/api/1/proposals', doc).success(function(data, status, headers, config) {
      var loc, port;
      loc = $location.host();
      port = $location.port();
      if (port && (port !== 80)) {
        loc += ":" + ($location.port());
      }
      $scope.linkToSnapshot("http://" + loc + "/#/p/" + data.id);
      return $scope.trace.shareProposal();
    }).error(function(data, status, headers, config) {
      return $scope.showMessage('Ooops !', "We couldn't save the proposal.\n<ul>\n  <li>Please check that your internet connection works.</li>\n  <li>If it works, we might have a problem on our side. Sorry about the situation!</li>\n</ul>");
    });
  };
});

var __hasProp = {}.hasOwnProperty;

app.directive("contenteditable", function() {
  return {
    require: "ngModel",
    link: function(scope, elm, attrs, ctrl) {
      var preventEmpty;
      preventEmpty = attrs.preventEmpty || false;
      ctrl.$render = function() {
        return elm.html(ctrl.$viewValue);
      };
      return elm.bind("blur", function() {
        return scope.$apply(function() {
          var newVal;
          if (preventEmpty && elm.html().replace(/^\s+|\s+$/g, "").length === 0) {
            return elm.html(ctrl.$viewValue);
          } else {
            newVal = elm.html().replace(/<br>/g, ' ');
            elm.html(newVal);
            return ctrl.$setViewValue(newVal);
          }
        });
      });
    }
  };
});

app.directive("piegraph", function() {
  return {
    restrict: "E",
    replace: true,
    template: '<div class="piegraph"></div>',
    scope: {
      width: '@',
      height: '@',
      slices: '=',
      colors: '='
    },
    link: function(scope, element, attrs) {
      var arc, color, height, pie, radius, svg, update, width, _ref;
      _ref = [parseInt(scope.width), parseInt(scope.height)], width = _ref[0], height = _ref[1];
      svg = d3.select(element[0]).append("svg").attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + (width / 2) + ", " + (height / 2) + ")");
      radius = Math.min(width, height) / 2 - 10;
      pie = d3.layout.pie().sort(null).value(function(d) {
        return d.value;
      });
      arc = d3.svg.arc().outerRadius(radius).innerRadius(0);
      color = d3.scale.ordinal().range(scope.colors);
      update = function(slices) {
        var g, nonZeroSlices, slice;
        nonZeroSlices = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = slices.length; _i < _len; _i++) {
            slice = slices[_i];
            if (slice.value > 0) {
              _results.push(slice);
            }
          }
          return _results;
        })();
        svg.selectAll('*').remove();
        if (nonZeroSlices.length > 0) {
          g = svg.selectAll(".arc").data(pie(nonZeroSlices)).enter().append("g").attr("class", "arc");
          g.append("path").attr("d", arc).style("fill", function(d) {
            return color(d.data.name);
          });
          return g.append("text").attr("transform", function(d) {
            return "translate(" + (arc.centroid(d)) + ")";
          }).attr("dy", ".35em").style("text-anchor", "middle").text(function(d) {
            return d.data.name;
          });
        } else {
          return svg.append("circle").attr("r", radius).attr('fill', '#fff').attr('stroke', '#98abc5');
        }
      };
      return scope.$watch('slices', update, true);
    }
  };
});

app.directive("sliceGraph", function($compile) {
  return {
    restrict: 'A',
    scope: {
      width: '@',
      height: '@',
      slices: '=',
      colors: '='
    },
    link: function(scope, element, attrs) {
      var update;
      update = function() {
        var bars, h, html, i, prevY, slice, style, _i, _len, _ref;
        $('.i-slice-graph').remove();
        html = [];
        html.push("<div class=\"i-slice-graph\">");
        prevY = 0;
        _ref = scope.slices;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          slice = _ref[i];
          h = 0;
          if (slice.value !== 0) {
            h = Math.round(+scope.height / 100 * slice.value);
          }
          style = [];
          style.push("left: 0; top: " + prevY + "px; width: " + (+scope.width) + "px; height: " + h + "px;");
          style.push("background-color: " + scope.colors[i] + ";");
          style = style.join(' ');
          html.push("  <div style=\"" + style + "\" popover-placement=\"right\" popover=\"" + slice.name + ": " + slice.value + "%\"></div>");
          prevY += h;
        }
        html.push("</div>");
        bars = $(html.join(''));
        element.append(bars);
        return $compile(bars)(scope);
      };
      return scope.$watch('slices', update, true);
    }
  };
});

app.directive("showInSections", function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var isViewed, offset, showHide, w;
      w = $(window);
      offset = 60;
      isViewed = function(elemId) {
        var docViewBottom, docViewTop, elem, elemBottom, elemTop;
        elem = $('#' + elemId);
        docViewTop = w.scrollTop();
        docViewBottom = docViewTop + w.height();
        elemTop = elem.offset().top;
        elemBottom = elemTop + elem.height();
        return (elemTop < docViewTop + offset) && (elemBottom > docViewTop);
      };
      showHide = function() {
        var section, sections, viewed, _i, _len;
        sections = attrs.showInSections.split(';');
        viewed = false;
        for (_i = 0, _len = sections.length; _i < _len; _i++) {
          section = sections[_i];
          if (viewed = isViewed(section)) {
            break;
          }
        }
        if (viewed) {
          return $(element).fadeIn();
        } else {
          return $(element).fadeOut();
        }
      };
      $(window).scroll(function() {
        return showHide();
      });
      return $timeout((function() {
        $(element).hide();
        return showHide();
      }), 1);
    }
  };
});

app.directive("valueCell", function($compile) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      var html, input, k, radioUnselector, typeDef, v, _ref;
      typeDef = scope.$eval(attrs.valueCell);
      if (!typeDef) {
        return;
      }
      radioUnselector = element.attr('radio-unselector');
      html = [];
      switch (typeDef.typeName) {
        case 'checkbox':
          html.push('<input @@@ type="checkbox"');
          if (typeDef["default"]) {
            html.push('checked="checked"');
          }
          html.push('></input>');
          break;
        case 'radio':
          html.push('<input @@@ type="checkbox"');
          html.push("ng-click=\"" + radioUnselector + "\"");
          html.push('></input>');
          break;
        case 'number':
          html.push('<input @@@ type="number"');
          html.push("value=\"" + typeDef["default"] + "\"");
          html.push('select-on-focus></input>');
          if (typeDef.unit) {
            html.push("<span class=\"value-unit\">" + typeDef.unit + "</span>");
          }
          break;
        case 'enum':
          scope.selectOptions = (function() {
            var _ref, _results;
            _ref = typeDef.values;
            _results = [];
            for (k in _ref) {
              if (!__hasProp.call(_ref, k)) continue;
              v = _ref[k];
              _results.push([v, k]);
            }
            return _results;
          })();
          html.push("<select @@@ ng-options=\"o[0] as o[1] for o in selectOptions\">");
          html.push('</select>');
      }
      html = html.join(' ');
      html = html.replace('@@@', "ng-model=\"" + (element.attr('ng-model')) + "\"");
      input = angular.element(html);
      element.append(input);
      $compile(input)(scope);
      if ((_ref = typeDef.typeName) === 'checkbox' || _ref === 'radio') {
        input.click(function(e) {
          return e.stopPropagation();
        });
        return $(element).click(function(e) {
          return scope.$apply(function() {
            var newVal;
            newVal = !input.prop('checked');
            input.prop('checked', newVal);
            ctrl.$setViewValue(newVal);
            if (element.attr('radio-unselector') && typeDef.typeName === 'radio') {
              return scope.$eval(radioUnselector);
            }
          });
        });
      }
    }
  };
});

app.directive("scrollTo", function($timeout) {
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      return element.bind("click", function() {
        return $timeout(function() {
          var offset, speed, target;
          offset = attrs.offset || 0;
          target = $('#' + attrs.scrollTo);
          speed = attrs.speed || 500;
          return $("html,body").stop().animate({
            scrollTop: target.offset().top - offset
          }, speed);
        }, 1);
      });
    }
  };
});

app.directive("fullyCentered", function($timeout) {
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      $(window).resize(function() {
        return $(element).css({
          position: 'absolute',
          left: ($(window).width() - $(element).outerWidth()) / 2,
          top: ($(window).height() - $(element).outerHeight()) / 2
        });
      });
      return $timeout((function() {
        return $(window).resize();
      }), 1);
    }
  };
});

app.directive("selectOnFocus", function() {
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      return $(element).on("click", function() {
        return $(element).select();
      });
    }
  };
});

app.directive("legacyBrowserRejector", function($window) {
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      return $window.onload = function() {
        return $.reject({
          reject: {
            all: false,
            msie5: true,
            msie6: true,
            msie7: true,
            msie8: true
          },
          browserInfo: {
            firefox: {
              text: 'Mozilla Firefox',
              url: 'http://www.mozilla.com/firefox/'
            },
            chrome: {
              text: 'Google Chrome',
              url: 'http://www.google.com/chrome/'
            },
            msie: {
              text: 'Internet Explorer',
              url: 'http://www.microsoft.com/windows/Internet-explorer/'
            }
          },
          imagePath: attrs.browserImagePath,
          display: ['firefox', 'chrome', 'msie']
        });
      };
    }
  };
});

modelDefs.add({
  id: 'd691b574-58d0-44dd-be19-7196d34d781f',
  name: 'Market Value',
  version: '1.0',
  image: 'marketValueModel.png',
  target: "If you want to match equity to monetary value of the contribution.",
  priority: 20,
  desc: "<p>This method compares market price for each contribution in the company.\nIt considers the opportunity cost of the lost salary, as well as assets and sales\nbenefitting the project.</p>\n<p>The method is inspired by the <a href=\"http://www.slicingpie.com/\">Slicing Pie</a> website.</p>",
  criterias: {
    marketSalary: {
      text: "What is the member's market salary per month?",
      type: types.number({
        "default": 0,
        min: 0,
        unit: '$'
      })
    },
    salary: {
      text: "How much does the member get salary from the company per month?",
      type: types.number({
        "default": 0,
        min: 0,
        unit: '$'
      })
    },
    hours: {
      text: "How many hours has the member been working for the company?",
      type: types.number({
        "default": 0,
        min: 0,
        unit: 'h'
      })
    },
    cash: {
      text: "How much cash is the member investing?",
      type: types.number({
        "default": 0,
        min: 0,
        unit: '$'
      })
    },
    otherItems: {
      text: "How much does the member bring in other valuables (premises, tools etc.)?",
      type: types.number({
        "default": 0,
        min: 0,
        unit: '$'
      })
    },
    sales: {
      text: "How much sales revenue is the member bringing in?",
      type: types.number({
        "default": 0,
        min: 0,
        unit: '$'
      })
    },
    salesCommissionPercent: {
      text: "What is the sales commission percent that is usually paid on the market?",
      type: types.number({
        "default": 0,
        min: 0,
        max: 100,
        unit: '%'
      })
    },
    salesCommissionPaid: {
      text: "How much sales commission has been paid to the member?",
      type: types.number({
        "default": 0,
        min: 0,
        unit: '$'
      })
    }
  },
  emphasis: {
    salary: {
      text: "How much do you value contributed work?",
      type: types.number({
        "default": 200,
        min: 0,
        unit: '%'
      })
    },
    cash: {
      text: "How much do you value contributed cash?",
      type: types.number({
        "default": 400,
        min: 0,
        unit: '%'
      })
    },
    otherItems: {
      text: "How much do you value contributed other items?",
      type: types.number({
        "default": 400,
        min: 0,
        unit: '%'
      })
    },
    sales: {
      text: "How much do you value sales?",
      type: types.number({
        "default": 200,
        min: 0,
        unit: '%'
      })
    }
  },
  score: function(self, members, messages, emphasis) {
    var member, ms, mv, pie, salaryPart, salesPart, _i, _j, _len, _len1, _results;
    pie = 0;
    for (_i = 0, _len = members.length; _i < _len; _i++) {
      member = members[_i];
      ms = member.scores = {
        slice: 0
      };
      mv = member.values;
      salaryPart = (mv.marketSalary - mv.salary) / 160 * mv.hours * (emphasis.salary / 100);
      if (salaryPart < 0) {
        messages.push("" + member.name + "'s salary is too high.");
        salaryPart = 0;
      }
      ms.slice = salaryPart;
      ms.slice += mv.cash * (emphasis.cash / 100);
      ms.slice += mv.otherItems * (emphasis.otherItems / 100);
      salesPart = ((mv.sales * mv.salesCommissionPercent / 100) - mv.salesCommissionPaid) * (emphasis.sales / 100);
      if (salesPart < 0) {
        messages.push("" + member.name + "'s sales commission is too high.");
        salaryPart = 0;
      }
      ms.slice += salesPart;
      pie += ms.slice;
    }
    _results = [];
    for (_j = 0, _len1 = members.length; _j < _len1; _j++) {
      member = members[_j];
      _results.push(member.equity = (Math.round(member.scores.slice / pie * 1000) / 10) || 0);
    }
    return _results;
  }
});

var __hasProp = {}.hasOwnProperty;

(function() {
  var valueEnum;
  valueEnum = function() {
    return types["enum"]({
      "default": 0,
      values: {
        'None': 0,
        'Little': 2,
        'Some': 5,
        'Plenty': 10
      }
    });
  };
  return modelDefs.add({
    id: '6cfb9e85-90fc-4faa-954a-d99c8a9adc33',
    name: 'Company Roles',
    version: '1.0',
    image: 'roleBasedModel.png',
    target: "If you want to share equity based on roles in the company.",
    priority: 10,
    desc: "<p>This method considers executive, development and business roles in the company,\nand scores each team member based on their contributions for each role.</p>\n<p>The method is inspired by the <a href=\"http://foundrs.com/\">Foundrs.com</a> website.</p>",
    criterias: {
      idea: {
        text: "Who had the original idea for the project?",
        type: types.checkbox()
      },
      participation: {
        text: "Compared to full time job, how much time the member contributes until you raise funding?",
        info: "100 = full time, 50 = half-time, 120 = 20% overtime",
        type: types.number({
          "default": 100,
          min: 1,
          max: 250,
          unit: '%'
        })
      },
      techParticipation: {
        text: "How much does the member participate into technical development?",
        type: valueEnum()
      },
      techLead: {
        text: "Who would lead the technical team if you would get more personnel?",
        type: types.radio()
      },
      leaveTech: {
        text: "If the member would leave the project, how much would it affect the development schedule?",
        type: valueEnum()
      },
      leaveFunding: {
        text: "If the member would leave the project, how much would it affect the chances of getting funded?",
        type: valueEnum()
      },
      launch: {
        text: "If the member would leave the project, how much would it affect the launch or initial traction?",
        type: valueEnum()
      },
      revenue: {
        text: "If the member would leave the project, how much would it affect generating the revenue quickly?",
        type: valueEnum()
      },
      pr: {
        text: "How much does the member participate to the creation of marketing materials?",
        type: valueEnum(),
        score: function(scores, value) {
          return scores.biz += value / 5;
        }
      },
      features: {
        text: "How much does the member contribute to the product features?",
        type: valueEnum()
      },
      budget: {
        text: "Who maintains the budgeting spreadsheets?",
        type: types.radio()
      },
      expenses: {
        text: "How much does the member contribute to the business expenses (business cards, web hosting...)?",
        type: valueEnum()
      },
      pitch: {
        text: "Who pitches investors?",
        type: types.radio()
      },
      connections: {
        text: "How well is the member connected with the target industry (potential customers, journalists, influencers)?",
        type: valueEnum()
      },
      ceo: {
        text: "Who is or becomes the CEO?",
        type: types.radio()
      }
    },
    emphasis: {
      ceo: {
        text: "How much do you value the executive role?",
        info: "100 = normal valuation, 50 = half-valuation, 200 = double valuation",
        type: types.number({
          "default": 140,
          min: 1,
          max: 250,
          unit: '%'
        })
      },
      dev: {
        text: "How much do you value the development role?",
        info: "100 = normal valuation, 50 = half-valuation, 200 = double valuation",
        type: types.number({
          "default": 120,
          min: 1,
          max: 250,
          unit: '%'
        })
      },
      biz: {
        text: "How much do you value the business and marketing role?",
        info: "100 = normal valuation, 50 = half-valuation, 200 = double valuation",
        type: types.number({
          "default": 100,
          min: 1,
          max: 250,
          unit: '%'
        })
      }
    },
    score: function(self, members, messages, emphasis) {
      var addScore, eBiz, eCeo, eDev, id, member, memberTotal, ms, mv, teamTotal, theCeo, ts, val, value, _i, _j, _len, _len1, _results;
      theCeo = members.filter(function(m) {
        return m.values.ceo;
      })[0];
      addScore = function(target, vals) {
        var k, v, _results;
        _results = [];
        for (k in vals) {
          if (!__hasProp.call(vals, k)) continue;
          v = vals[k];
          _results.push(target[k] += v);
        }
        return _results;
      };
      ts = {
        ceo: 0,
        dev: 0,
        biz: 0
      };
      for (_i = 0, _len = members.length; _i < _len; _i++) {
        member = members[_i];
        ms = member.scores = {
          ceo: 0,
          dev: 0,
          biz: 0
        };
        mv = member.values;
        if (mv.idea) {
          addScore(ms, {
            ceo: 5,
            dev: 3,
            biz: 3
          });
        }
        addScore(ms, {
          dev: mv.techParticipation
        });
        if (mv.techLead) {
          addScore(ms, {
            ceo: 1,
            dev: 10
          });
        }
        addScore(ms, {
          ceo: mv.leaveTech / 10,
          dev: mv.leaveTech
        });
        addScore(ms, {
          ceo: mv.leaveFunding
        });
        addScore(ms, {
          ceo: mv.launch / 3,
          dev: mv.launch / 3,
          biz: mv.launch / 3
        });
        addScore(ms, {
          ceo: mv.revenue / 5,
          biz: mv.revenue
        });
        addScore(ms, {
          biz: mv.pr / 5
        });
        addScore(ms, {
          ceo: mv.features / 2,
          dev: mv.features / 5,
          biz: mv.features / 5
        });
        if (mv.budget) {
          addScore(ms, {
            ceo: 3,
            biz: 5
          });
        }
        addScore(ms, {
          ceo: mv.expenses / 5,
          biz: mv.expenses / 5
        });
        if (mv.pitch) {
          addScore(ms, {
            ceo: 10,
            biz: 1
          });
        }
        addScore(ms, {
          ceo: mv.connections / 3,
          biz: mv.connections
        });
        if (mv.ceo) {
          addScore(ms, {
            ceo: 10
          });
        }
        for (id in ms) {
          if (!__hasProp.call(ms, id)) continue;
          value = ms[id];
          val = ms[id] = ms[id] * (mv.participation / 100);
          ts[id] += val;
        }
      }
      if (!theCeo) {
        messages.push("You haven't selected the CEO.");
      } else if (theCeo.scores.ceo < 35) {
        messages.push('You appear to have a weak CEO.');
      }
      if (ts.dev < 25) {
        messages.push('You should strengthen your development team.');
      }
      if (ts.biz < 20) {
        messages.push('You should strengthen your business and marketing team.');
      }
      eCeo = emphasis.ceo / 100;
      eDev = emphasis.dev / 100;
      eBiz = emphasis.biz / 100;
      teamTotal = ts.ceo * eCeo + ts.dev * eDev + ts.biz * eBiz;
      _results = [];
      for (_j = 0, _len1 = members.length; _j < _len1; _j++) {
        member = members[_j];
        ms = member.scores;
        memberTotal = ms.ceo * eCeo + ms.dev * eDev + ms.biz * eBiz;
        member.equity = (Math.round(memberTotal / teamTotal * 1000) / 10) || 0;
        if (theCeo && (ms.ceo > theCeo.scores.ceo)) {
          _results.push(messages.push("Maybe " + member.name + " should be the CEO."));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  });
})();

var __hasProp = {}.hasOwnProperty;

modelDefs.add({
  id: '6ee7289c-6eb6-4239-9fe1-5ded5dd511e4',
  name: 'Relative Importance',
  version: '1.0',
  image: 'weightedAspectsModel.png',
  target: "If you want something quick and simple",
  priority: 30,
  desc: "<p>This method considers relative importance of various aspect related to establishing a company. It's quick to fill, though highly subjective.</p>\n<p>The method is inspired by the <a href=\"http://www.andrew.cmu.edu/user/fd0n/35%20Founders'%20Pie%20Calculator.htm\">Founders Pie Calculator</a>.</p>",
  criterias: {
    idea: {
      text: "How much has the member been contributing to the original idea? (0-10)",
      type: types.number({
        "default": 0,
        min: 0,
        max: 10
      })
    },
    businessPlan: {
      text: "How much has the member been contributing to the business plan? (0-10)",
      type: types.number({
        "default": 0,
        min: 0,
        max: 10
      })
    },
    domainExpertise: {
      text: "How well does the member know your target industry, and how well they are connected? (0-10)",
      type: types.number({
        "default": 0,
        min: 0,
        max: 10
      })
    },
    commitmentAndRisk: {
      text: "How committed the member is in terms of consumed time and money? (0-10)",
      type: types.number({
        "default": 0,
        min: 0,
        max: 10
      })
    },
    responsibilities: {
      text: "How demanding are the responsibilities of the member? (0-10)",
      type: types.number({
        "default": 0,
        min: 0,
        max: 10
      })
    }
  },
  emphasis: {
    idea: {
      text: "How much do you value the idea? (0-10)",
      type: types.number({
        "default": 5,
        min: 0,
        max: 10
      })
    },
    businessPlan: {
      text: "How much do you value the business plan? (0-10)",
      type: types.number({
        "default": 5,
        min: 0,
        max: 10
      })
    },
    domainExpertise: {
      text: "How much do you value the domain expertise? (0-10)",
      type: types.number({
        "default": 5,
        min: 0,
        max: 10
      })
    },
    commitmentAndRisk: {
      text: "How much do you value the commitment and risk? (0-10)",
      type: types.number({
        "default": 5,
        min: 0,
        max: 10
      })
    },
    responsibilities: {
      text: "How much do you value the demandingness of responsibilities? (0-10)",
      type: types.number({
        "default": 5,
        min: 0,
        max: 10
      })
    }
  },
  score: function(self, members, messages, emphasis) {
    var k, member, pie, v, _i, _j, _len, _len1, _results;
    pie = 0;
    for (_i = 0, _len = members.length; _i < _len; _i++) {
      member = members[_i];
      member.scores = {
        slice: 0
      };
      for (k in emphasis) {
        if (!__hasProp.call(emphasis, k)) continue;
        v = emphasis[k];
        member.scores.slice += member.values[k] * v;
      }
      pie += member.scores.slice;
    }
    _results = [];
    for (_j = 0, _len1 = members.length; _j < _len1; _j++) {
      member = members[_j];
      _results.push(member.equity = (Math.round(member.scores.slice / pie * 1000) / 10) || 0);
    }
    return _results;
  }
});

var __hasProp = {}.hasOwnProperty,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

app.service("modelRepo", function() {
  var Member, Model, ModelRepo, Team;
  Member = (function() {
    function Member(id, name, modelDef) {
      var crit, _ref;
      this.id = id;
      this.name = name;
      this.modelDef = modelDef;
      this.values = {};
      this.scores = {};
      this.valueErrors = {};
      _ref = modelDef.criterias;
      for (id in _ref) {
        if (!__hasProp.call(_ref, id)) continue;
        crit = _ref[id];
        this.values[id] = crit.type["default"];
      }
      this.equity = 0;
    }

    return Member;

  })();
  Team = (function() {
    function Team(modelDef) {
      this.modelDef = modelDef;
      this.members = [];
      this.messages = [];
    }

    Team.prototype.addMember = function(id, name) {
      var member;
      member = new Member(id, name, this.modelDef);
      this.members.push(member);
      return member;
    };

    Team.prototype.removeMember = function(index) {
      return this.members.splice(index, 1);
    };

    return Team;

  })();
  Model = (function() {
    function Model(modelDef) {
      this.modelDef = modelDef;
      this.emphasis = {};
      this.emphasisErrors = {};
      this.hasInputErrors = false;
      this.init();
    }

    Model.prototype.init = function() {
      var e, id, _ref, _results;
      this.team = new Team(this.modelDef);
      _ref = this.modelDef.emphasis;
      _results = [];
      for (id in _ref) {
        if (!__hasProp.call(_ref, id)) continue;
        e = _ref[id];
        _results.push(this.emphasis[id] = e.type["default"]);
      }
      return _results;
    };

    Model.prototype.score = function() {
      var allZeros, error, k, m, member, slice, t, v, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _results;
      this.hasInputErrors = false;
      _ref = this.team.members;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        m = _ref[_i];
        _ref1 = m.values;
        for (k in _ref1) {
          if (!__hasProp.call(_ref1, k)) continue;
          v = _ref1[k];
          t = this.modelDef.criterias[k].type;
          error = t.check(v);
          if (error) {
            m.valueErrors[k] = error;
            this.hasInputErrors = true;
          } else if (m.valueErrors[k]) {
            delete m.valueErrors[k];
          }
        }
      }
      _ref2 = this.emphasis;
      for (k in _ref2) {
        if (!__hasProp.call(_ref2, k)) continue;
        v = _ref2[k];
        t = this.modelDef.emphasis[k].type;
        error = t.check(v);
        if (error) {
          this.emphasisErrors[k] = error;
          this.hasInputErrors = true;
        } else if (this.emphasisErrors[k]) {
          delete this.emphasisErrors[k];
        }
      }
      this.team.messages = [];
      this.modelDef.score(this.modelDef, this.team.members, this.team.messages, this.emphasis);
      allZeros = true;
      _ref3 = this.team.members;
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        member = _ref3[_j];
        if (member.equity !== 0) {
          allZeros = false;
          break;
        }
      }
      if (allZeros) {
        slice = Math.round(100 / this.team.members.length * 10) / 10;
        _ref4 = this.team.members;
        _results = [];
        for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
          member = _ref4[_k];
          _results.push(member.equity = slice);
        }
        return _results;
      }
    };

    Model.prototype.getCriteriaIds = function() {
      var id, v, _ref, _results;
      _ref = this.modelDef.criterias;
      _results = [];
      for (id in _ref) {
        if (!__hasProp.call(_ref, id)) continue;
        v = _ref[id];
        _results.push(id);
      }
      return _results;
    };

    Model.prototype.getEmphasisIds = function() {
      var id, v, _ref, _results;
      _ref = this.emphasis;
      _results = [];
      for (id in _ref) {
        if (!__hasProp.call(_ref, id)) continue;
        v = _ref[id];
        _results.push(id);
      }
      return _results;
    };

    return Model;

  })();
  ModelRepo = (function() {
    function ModelRepo(modelDefList) {
      var def, _i, _len, _ref;
      this.modelDefList = modelDefList;
      this.defaultMemberIds = "ABCDEFGHIJKLMN";
      this.usedMemberIds = [];
      this.models = [];
      _ref = this.modelDefList;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        def = _ref[_i];
        this.createModel(def);
      }
      this.activeModel = this.models[0];
    }

    ModelRepo.prototype.init = function() {
      var model, _i, _len, _ref, _results;
      this.usedMemberIds = [];
      _ref = this.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        model = _ref[_i];
        _results.push(model.init());
      }
      return _results;
    };

    ModelRepo.prototype.createModel = function(modelDef) {
      return this.models.push(new Model(modelDef));
    };

    ModelRepo.prototype.isTeamAtMax = function() {
      return this.memberCount() >= 6;
    };

    ModelRepo.prototype.isTeamAtMin = function() {
      return this.memberCount() <= 2;
    };

    ModelRepo.prototype.memberCount = function() {
      return this.usedMemberIds.length;
    };

    ModelRepo.prototype.getNextMemberId = function() {
      var mid, _i, _len, _ref;
      _ref = this.defaultMemberIds;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        mid = _ref[_i];
        if (__indexOf.call(this.usedMemberIds, mid) < 0) {
          return mid;
        }
      }
      return 'X';
    };

    ModelRepo.prototype.addMember = function(memberId, memberName) {
      var mid, mname, model, _i, _len, _ref, _results;
      if (this.isTeamAtMax()) {
        return;
      }
      mid = memberId || this.getNextMemberId();
      this.usedMemberIds.push(mid);
      mname = memberName || ("Member " + mid);
      _ref = this.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        model = _ref[_i];
        _results.push(model.team.addMember(mid, mname));
      }
      return _results;
    };

    ModelRepo.prototype.removeMember = function(index) {
      var model, _i, _len, _ref, _results;
      if (this.isTeamAtMin()) {
        return;
      }
      this.usedMemberIds.splice(index, 1);
      _ref = this.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        model = _ref[_i];
        _results.push(model.team.removeMember(index));
      }
      return _results;
    };

    ModelRepo.prototype.syncMemberNames = function(fromModel) {
      var i, m, members, model, _i, _len, _ref, _results;
      members = fromModel.team.members;
      _ref = this.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        model = _ref[_i];
        if (model !== fromModel) {
          _results.push((function() {
            var _j, _len1, _ref1, _results1;
            _ref1 = model.team.members;
            _results1 = [];
            for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
              m = _ref1[i];
              _results1.push(m.name = members[i].name);
            }
            return _results1;
          })());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    ModelRepo.prototype.serialize = function() {
      var k, member, model, sMember, sModel, sRepo, v, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      sRepo = {
        activeModelId: this.activeModel.modelDef.id,
        models: {}
      };
      _ref = this.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        model = _ref[_i];
        sRepo.models[model.modelDef.id] = sModel = {};
        sModel.version = model.modelDef.version;
        sModel.name = model.modelDef.name;
        sModel.team = {};
        sModel.team.members = [];
        _ref1 = model.team.members;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          member = _ref1[_j];
          sMember = {};
          sMember.id = member.id;
          sMember.name = member.name;
          sMember.values = member.values;
          sModel.team.members.push(sMember);
        }
        sModel.emphasis = {};
        _ref2 = model.emphasis;
        for (k in _ref2) {
          if (!__hasProp.call(_ref2, k)) continue;
          v = _ref2[k];
          sModel.emphasis[k] = v;
        }
      }
      return sRepo;
    };

    ModelRepo.prototype.deserialize = function(sRepo) {
      var assert, errors, firstModel, id, k, majorVersion, member, model, modelDeserialized, sMajorVersion, sMember, sModel, v, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4;
      this.init();
      errors = [];
      assert = function(field, val, typ) {
        if (typeof val !== typ) {
          return errors.push("field " + field + ": " + val + " is not of type " + typ);
        }
      };
      try {
        firstModel = true;
        assert('sRepo', sRepo, 'object');
        assert('sRepo.activeModelId', sRepo.activeModelId, 'string');
        assert('sRepo', sRepo.models, 'object');
        _ref = sRepo.models;
        for (k in _ref) {
          if (!__hasProp.call(_ref, k)) continue;
          v = _ref[k];
          _ref1 = [k, v], id = _ref1[0], sModel = _ref1[1];
          assert('sModel.id', id, 'string');
          assert('sModel', sModel, 'object');
          modelDeserialized = false;
          _ref2 = this.models;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            model = _ref2[_i];
            if (model.modelDef.id !== id) {
              continue;
            }
            if (sRepo.activeModelId === id) {
              this.activeModel = model;
            }
            assert('sModel.version', sModel.version, 'string');
            majorVersion = parseInt(model.modelDef.version.split('.')[0]);
            sMajorVersion = parseInt(sModel.version.split('.')[0]);
            if (majorVersion !== sMajorVersion) {
              errors.push("Major versions differ in model " + id);
            }
            assert('sModel.team', sModel.team, 'object');
            assert('sModel.team.members', sModel.team.members, 'object');
            _ref3 = sModel.team.members;
            for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
              sMember = _ref3[_j];
              if (firstModel) {
                assert('sMember.id', sMember.id, 'string');
                this.usedMemberIds.push(sMember.id);
              }
              assert('sMember.name', sMember.name, 'string');
              member = model.team.addMember(sMember.id, sMember.name);
              assert('sMember.values', sMember.values, 'object');
              member.values = sMember.values;
            }
            if (sModel.emphasis) {
              assert('sModel.emphasis', sModel.emphasis, 'object');
              _ref4 = sModel.emphasis;
              for (k in _ref4) {
                if (!__hasProp.call(_ref4, k)) continue;
                v = _ref4[k];
                model.emphasis[k] = v;
              }
            }
            modelDeserialized = true;
          }
          if (!modelDeserialized) {
            errors.push("Couldn't find model '" + name + "' to deserialize into");
          }
          firstModel = false;
        }
      } catch (_error) {}
      if (errors.length > 0) {
        console.error("Errors while deserializing:\n  -", errors.join('\n  - '));
      }
      return errors.length === 0;
    };

    return ModelRepo;

  })();
  this.createRepo = function(modelDefList) {
    return new ModelRepo(modelDefList);
  };
  return this;
});

app.service("trace", function($window) {
  var traceCounter;
  traceCounter = {};
  this.createGaArray = function(params, prio) {
    params = params.split(':');
    if (params[0].length === 0) {
      params = [];
    }
    if (params.length > 3) {
      params = params.slice(0, 3);
    }
    while (params.length < 3) {
      params.push(null);
    }
    params.push(prio);
    return ['_trackEvent'].concat(params);
  };
  this.trace = function(params, prio) {
    var arr;
    if (traceCounter[params] === void 0) {
      traceCounter[params] = 1;
    } else {
      traceCounter[params] += 1;
    }
    arr = this.createGaArray(params, prio);
    if ($window._gaq) {
      $window._gaq.push(arr);
    }
    return arr;
  };
  this.traceFirst = function(params, prio) {
    if (traceCounter[params] === 1) {
      return [];
    }
    return this.trace(params, prio);
  };
  this.addMember = function() {
    return this.traceFirst('Click:Add / Remove Member', 10);
  };
  this.removeMember = function() {
    return this.traceFirst('Click:Add / Remove Member', 10);
  };
  this.changeMemberName = function() {
    return this.traceFirst('Click:Change Member Name', 20);
  };
  this.openEmail = function() {
    return this.traceFirst('Click:Open Email', 20);
  };
  this.openTwitter = function() {
    return this.traceFirst('Click:Open Twitter', 5);
  };
  this.openGithub = function() {
    return this.traceFirst('Click:Open Github', 5);
  };
  this.showAbout = function() {
    return this.traceFirst('Click:Show About', 5);
  };
  this.showTos = function() {
    return this.traceFirst('Click:Show TOS', 10);
  };
  this.wantMoreResults = function() {
    return this.trace('Click:Show More Results', 80);
  };
  this.cancelMoreResults = function() {
    return this.trace('Click:Cancel More Results', -80);
  };
  this.loadOwnProposal = function() {
    return this.trace('Persist:Load Own Proposal', 60);
  };
  this.loadPartnerProposal = function() {
    return this.trace('Persist:Load Partner Proposal', 100);
  };
  this.shareProposal = function() {
    return this.trace('Persist:Share Prososal', 80);
  };
  this.sendQuestionary = function() {
    return this.trace('Persist:Send Questionary', 150);
  };
  this.changeContrib = function() {
    return this.traceFirst('Click:Change Contrib', 1);
  };
  this.changeEmphasis = function() {
    return this.traceFirst('Click:Change Emphasis', 2);
  };
  this.switchModel = function() {
    return this.traceFirst('Click:Switch Model', 10, 3);
  };
  return this;
});

define([
    'jquery',
    'knockout',
    'underscore',
    'select2',
    'selectWoo'
], function($, ko, _) {
    ko.bindingHandlers.select2Query = {
        init: function(el, valueAccessor, allBindingsAccessor) {
            var allBindings = allBindingsAccessor().select2Query;
            var select2Config = ko.utils.unwrapObservable(allBindings.select2Config);
            select2Config = Object.assign({}, select2Config);
            select2Config = _.defaults(select2Config, {
                clickBubble: true,
                multiple: false,
                allowClear: true,
            });
            var value = select2Config.value;

            ko.utils.domNodeDisposal.addDisposeCallback(el, function() {
                $(el).selectWoo('destroy');
            });

            var placeholder = select2Config.placeholder;
            if (ko.isObservable(placeholder)) {
                placeholder.subscribe(function(newItems) {
                    select2Config.placeholder = newItems;
                    $(el).selectWoo("destroy").selectWoo(select2Config);
                });
                select2Config.placeholder = select2Config.placeholder();
                if (select2Config.allowClear) {
                    select2Config.placeholder = select2Config.placeholder === "" ? " " : select2Config.placeholder;
                }
            }

            //select2Config.value = value();
            $(el).selectWoo(select2Config);

            if (value) {
                $(el).selectWoo("val", value());
                value.subscribe(function(newVal) {
                    select2Config.value = newVal;
                    $(el).selectWoo("val", newVal);
                }, this);
                $(el).on("change", function(val) {
                    if (val.val === "") {
                        val.val = null;
                    }
                    return value(val.val);
                });
            }

            if (ko.unwrap(select2Config.disabled)) {
                $(el).selectWoo("disable");
                select2Config.disabled.subscribe(function(val){
                    if (val === false) {
                        $(el).selectWoo("enable");
                    }
                });
            }

            $(el).on("select2-opening", function() {
                if (select2Config.clickBubble) {
                    $(el).parent().trigger('click');
                }
            });

            if (typeof select2Config.onSelect === 'function') {
                $(el).on("select2-selecting", function(e) {
                    select2Config.onSelect(e.choice);
                });
            }
            if (typeof select2Config.onClear === 'function') {
                $(el).on("select2-clearing", function(e) {
                    select2Config.onClear(e.choice);
                });
            }

        }
    };

    return ko.bindingHandlers.select2;
});

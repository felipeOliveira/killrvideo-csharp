﻿// The header functionality on all pages (requires bootstrap for the logged in user dropdown which may be present)
define(["knockout", "jquery", "app/shared/tour", "app/shared/main-tour", "lib/knockout-extenders", "bootstrap", "lib/knockout-tour"],
    function(ko, $, tourViewModel, mainTourDefinition) {
        // A view model for the header/navbar
        return function headerViewModel() {
            var self = this;

            // The value in the search box, throttled so that we don't constantly update as they are typing
            self.searchValue = ko.observable("").extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 400 } });

            // A list of query suggestions, using the async extender to provide a value when a query is in-flight
            self.querySuggestions = ko.computed(function() {
                var search = self.searchValue();
                if (search.length === 0)
                    return [];

                return $.getJSON("/search/suggestqueries", { query: search, pageSize: 10 }).then(function(response) {
                    // If we failed for some reason, just return an empty array
                    if (!response.success)
                        return [];

                    return response.data.suggestions;
                });
            }).extend({ async: [] });

            // The guided tour model
            self.tour = new tourViewModel(mainTourDefinition);

            // Handler for when the enable/disable tour UI is clicked on
            self.tourClick = function() {
                self.tour.enabled(!self.tour.enabled());
            };
            
            // Whether or not to show the "What is this?" section
            self.showWhatIsThis = ko.observable(false);

            // Toggle the what is this section
            self.toggleWhatIsThis = function() {
                self.showWhatIsThis(!self.showWhatIsThis());
            };

            var defaultUser = {
                isLoggedIn: false,
                profile: null
            };

            // The currently logged in user
            self.loggedInUser = ko.computed(function() {
                return $.getJSON("/account/current").then(function(response) {
                    // If we failed for some reason, just return the default user
                    if (!response.success)
                        return defaultUser;

                    return response.data;
                });
            }).extend({ async: defaultUser });

            // Logs a user out
            self.logoutUser = function() {
                $.getJSON("/account/signout").then(function(response) {
                    // If we failed for some reason, just bail
                    if (!response.success)
                        return;

                    // Redirect to the home page
                    if (window.location.pathname === "/") {
                        window.location.reload();
                    } else {
                        window.location.href = "/";
                    }
                });
            };
        };
    });
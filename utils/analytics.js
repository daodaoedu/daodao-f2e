import ReactGA from "react-ga";

export const initGA = (gaId) => {
  console.log("GA init");
  ReactGA.initialize(gaId);
};

export const logPageView = () => {
  console.log(`Logging pageview for ${window.location.pathname}`);
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
};

export const logEvent = (category = "", action = "", label = "", value = null) => {
  if (category && action) {
    const eventParams = {
      category,
      action,
      label
    };

    if (value !== null) {
      eventParams.value = value;
    }

    ReactGA.event(eventParams);
  }
};

export const logException = (description = "", fatal = false) => {
  if (description) {
    ReactGA.exception({ description, fatal });
  }
};

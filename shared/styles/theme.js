// https://github.com/mui-org/material-ui/blob/master/examples/nextjs/src/theme.js
import { createTheme } from "@material-ui/core/styles";

// Create a theme instance.
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1050,
      xl: 1300,
    },
  },
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          body1: "span",
          body2: "span",
        },
      },
    },
  },
  palette: {
    primary: {
      main: "#fff",
    },
    secondary: {
      main: "#32aedd",
    },
    link: {
      main: "#1461ad",
      contrastText: "#fff",
    },
    text: {
      main: "#0f0f0f",
    },
    helper: {
      main: "#71717a",
    },
  },
});

export default theme;

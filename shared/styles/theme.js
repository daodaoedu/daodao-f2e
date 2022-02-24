// https://github.com/mui-org/material-ui/blob/master/examples/nextjs/src/theme.js
import { createTheme } from "@mui/material/styles";

// Create a theme instance.
const theme = createTheme({
  typography: {
    h1: {
      fontSize: "40px",
      fontWeight: "500",
    },
    h2: {
      fontSize: "32px",
      fontWeight: "500",
    },
    h3: {
      fontSize: "24px",
      fontWeight: "500",
    },
  },
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
      // main: "#fff",
      main: "#16b9b3",
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

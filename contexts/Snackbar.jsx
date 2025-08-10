import { createContext, useContext, useState } from 'react';
import MuiSnackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const SnackbarContext = createContext({
  pushSnackbar: () => Promise.resolve(),
});

export const useSnackbar = () => useContext(SnackbarContext);

function CloseButton({ onClick }) {
  return (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={onClick}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );
}

export default function SnackbarProvider({ children }) {
  const [queue, setQueue] = useState([]);

  const pushSnackbar = ({
    message, type, vertical = 'bottom', horizontal = 'left',
  }) => new Promise((resolve) => {
    setQueue((pre) => [
      ...pre,
      {
        id: Math.random(), open: true, message, resolve, type, vertical, horizontal,
      },
    ]);
  });

  const closeSnackbar = (id) => (e) => {
    e?.stopPropagation?.();
    setQueue((pre) => {
      const index = pre.findIndex((data) => data.id === id);
      if (!(index > -1)) return pre;
      queue[index].resolve();
      return [...pre.slice(0, index), ...pre.slice(index + 1)];
    });
  };

  return (
    <SnackbarContext.Provider value={{ pushSnackbar }}>
      {children}
      {queue.map((data) => (
        <MuiSnackbar
          key={data.id}
          anchorOrigin={{ vertical: data.vertical, horizontal: data.horizontal }}
          open={data.open}
          sx={{ '.MuiSnackbarContent-root': { backgroundColor: data.type === 'error' ? '#f33' : '#333' } }}
          message={data.message}
          onClose={closeSnackbar(data.id)}
          action={<CloseButton onClick={closeSnackbar(data.id)} />}
          autoHideDuration={5000}
        />
      ))}
    </SnackbarContext.Provider>
  );
}

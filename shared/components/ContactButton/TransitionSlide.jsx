import { forwardRef } from 'react';
import { Slide } from '@mui/material';

const TransitionSlide = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default TransitionSlide;

import React, { useLayoutEffect, useRef } from 'react';

// Content er sathe height barbe (scrollbar lage na)
const AutoTextarea = ({ value, ...rest }) => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return <textarea ref={ref} value={value} rows={1} {...rest} />;
};

export default AutoTextarea;
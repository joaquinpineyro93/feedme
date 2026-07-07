import React from 'react';

export default function BubbleInverted({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M12 10h40a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6H30l-12 10v-10h-6a6 6 0 0 1-6-6V16a6 6 0 0 1 6-6Z" fill="#141210" />
      <path d="M28 20v24M28 20c-3 0-5 2-5 6s2 5 5 5M36 20v9c0 2 1 3 3 3s3-1 3-3v-9M39 20v24" stroke="#FAF6EF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

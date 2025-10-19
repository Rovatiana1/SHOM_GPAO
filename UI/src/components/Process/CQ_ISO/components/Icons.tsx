// components/Process/CQ_ISO/components/Icons.tsx
import React from 'react';

const iconProps = {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as "round",
    strokeLinejoin: "round" as "round",
};

const Upload = () => (
    <svg {...iconProps}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

const Download = () => (
    <svg {...iconProps}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

const Close = () => (
    <svg {...iconProps}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const Check = () => (
    <svg {...iconProps} strokeWidth="3">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const X = () => (
    <svg {...iconProps} strokeWidth="3">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const ChevronLeft = () => (
    <svg {...iconProps}>
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

const ChevronRight = () => (
    <svg {...iconProps}>
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const Camera = () => (
    <svg {...iconProps}>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
    </svg>
);

const Icons = {
    Upload,
    Download,
    Close,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    Camera
};

export default Icons;
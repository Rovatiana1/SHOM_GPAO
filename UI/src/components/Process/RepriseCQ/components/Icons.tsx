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

const Upload = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

const Download = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

const Reset = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props}>
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
    </svg>
);

const Chart = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props}>
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
);

const Close = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const Settings = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props}>
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);

const Add = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const Camera = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props}>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
    </svg>
);

const List = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props}>
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
);

const Trash2 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

const Check = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} strokeWidth="3" {...props}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const X = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} strokeWidth="3" {...props}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const ChevronLeft = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props}>
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

const ChevronRight = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props}>
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const Archive = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props}>
        <path d="M21 8v13H3V8" />
        <path d="M1 3h22v5H1z" />
        <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
);

const Eye = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const Icons = {
    Upload,
    Download,
    Reset,
    Chart,
    Close,
    Settings,
    Add,
    Camera,
    List,
    Trash2,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    Archive,
    Eye,
};

export default Icons;
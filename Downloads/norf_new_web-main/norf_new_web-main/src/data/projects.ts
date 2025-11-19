export type Project = {
  id: number;
  title: string;
  category: string;
  year: string;
  thumbnail: string;
  mediaType: "image" | "video";
  description: string;
  credits: { label: string; value: string }[];
  images: string[];
  youtubeUrl?: string;
};

export const projects: Project[] = [
  {
    id: 1,
    title: "Teachers Day",
    category: "Commercial",
    year: "2025",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1760867948/Teachers_qvzhpk.webm",
    mediaType: "video",
    description:
      "A shortform documentary capturing the voices of teacher educators as they reflect on the challenges of shaping future teachers.\n\nThe video highlights their personal experiences and what World Teachers' Day means to them.",
    credits: [
      { label: "Director", value: "Blades" },
      { label: "DOP", value: "Emery Murenzi" },
      { label: "Editor", value: "Blades" },
      { label: "Colorist", value: "I.Heritier" },
      { label: "Photographer", value: "MCory" },
      { label: "Copywriter", value: "Ben Flee" },
      

    ],
    images: [
      "https://vimeo.com/1128770506?fl=ip&fe=ec"
    ]
  },
  {
    id: 2,
    title: "Fatherhood - Summer camp",
    category: "Commercial",
    year: "2025",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1760867938/ftech_nd8np4.webm",
    mediaType: "video",
    description:
      "A glimpse into the summer bootcamp hosted by Fatherhood Tech, this video captures the special moments, energy, and impact of the holiday program. From hands-on activities to meaningful connections",
    credits: [
      { label: "Director", value: "Blades" },
      { label: "DOP", value: "Emery Murenzi" },
      { label: "Editor and Colorist", value: "I.Heritier" },
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760625330/fthood_nj4e8v.webp",
    ]
  },
  {
    id: 3,
    title: "Bel - Kumutima",
    category: "Music Video",
    year: "2025",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1760710157/Bel_m51odc.webm",
    mediaType: "video",
    youtubeUrl: "https://www.youtube.com/embed/gLbciPJDTX8",
    description: "",
    credits: [
      { label: "Artist", value: "Bel" },
      { label: "Director", value: "Blades" },
      { label: "DOP", value: "Emery Murenzi" },
      { label: "Editor", value: "Blades" },
      { label: "Colorist", value: "I.Heritier" },
      { label: "BTS Photographer", value: "Mucyo Photos" },
      { label: "Fixer", value: "kevinlloydny" },
      { label: "Gaffer", value: "Bonheur" },
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760611282/kumutima_yksrdb.webp",
    ]
  },
  {
    id: 4,
    title: "Ganymede",
    category: "Branding",
    year: "2025",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1760974872/gaga_vbxz3b.webm",
    mediaType: "video",
    description:
      "Garymade is a forward-thinking architectural firm committed to delivering affordable, modern, and sustainable housing solutions for middle and lower income communities in Rwanda.\n\n They balance innovative design with functionality, prioritizing eco friendly materials, energy efficient technologies, and cost effective construction to create high quality, resilient homes.",
    credits: [
      { label: "Client", value: "Ganymede" },
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760956315/gany1_h3u4bd.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760956315/gany2_rdklbn.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760956315/gany4_johbmt.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760956316/gany5_t93ipa.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760956317/gany6_tyjl5c.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760956316/gany3_flzunl.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760956316/gany7_thztau.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760956320/gany9_pqiewm.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760956319/gany10_b8nl7q.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760956321/gany13_kf2lna.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760956321/gany12_skcrxk.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760956319/gany8_xn3llj.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760956323/gany15_ldjzkj.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760956322/gany14_bkzo5w.webp"
    ]
  },
  {
    id: 5,
    title: "Worldwide Construction",
    category: "Branding",
    year: "2025",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1760961422/scene_6e114874_q1j1mw.webm",
    mediaType: "video",
    description:
      "Worldwide Construction Ltd is a nationwide Rwandan construction firm in Gihara, oﬀering residential,governmental, turnkey, and renovation services.\n\n They target diverse clients from government to local communities, emphasizing reliability, national reach, community impact, modern methods with local understanding, and professionalism in all projects, especially infrastructure.",
    credits: [
      { label: "Client", value: "Worldwide Construction" },
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760944972/world9_uur8g4.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760944972/world8_ffzybj.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760945024/world5_sg1adq.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760944972/world7_pmebqh.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760945023/world1_hvh0u6.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760945026/world4_oltg40.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760944973/world6_jbhkqi.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760945024/world2_np4cpx.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760945024/world3_cvm7aj.webp",
    ]
  },
  {
    id: 6,
    title: "Basai",
    category: "Branding",
    year: "2025",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1760975652/Basai_eab2yf.webm",
    mediaType: "video",
    description:
      "Basai is a dynamic Rwandan firm based in Kigali, offering innovative solutions in construction and graphic design.\n\n They approached us to create a visual identity for their brand and demonstrate how their logo could be applied across various brand touchpoints.",
    credits: [
      { label: "Client", value: "Basai" },
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760957450/basa1_r32vwv.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760957451/basa2_xtt3zh.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760957451/basa3_cuhjf7.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760957451/basa4_kcdi9r.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760957452/basa5_mkmjm0.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760957453/basa6_w6zb2w.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760957454/basa7_d6msg8.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760957456/basa8_cphhoj.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760957458/basa9_ii9vlo.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760957457/basa10_jkh2jd.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760957459/basa11_utcfv7.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760957459/basa12_cst546.webp"
    ]
  },
  {
    id: 7,
    title: "Menyesha",
    category: "Branding",
    year: "2025",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1760979080/meny_hhkppi.webm",
    mediaType: "video",
    description:
      "Menyesha is a digital notarization platform that modernizes and simplifies the notarization process through In-Person Electronic Notarization (IPEN) and Remote Online Notarization (RON).\n\nTo bring Menyesha's vision to life, we crafted a brand identity that seamlessly integrates its mission to transform notarization for the digital age. Inspired by the document holder, the logo mark symbolizes the shift from paper to secure, seamless digital notarization.\n\nAuthenticity is at the heart of Menyesha's image style, capturing real, everyday life in Rwanda. From young professionals to elderly users, the brand's visuals emphasize inclusivity, making notarization feel effortless and accessible.",
    credits: [
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1740851650/pb1fmio1flqfscdejyjo.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1740851650/lxcq1rldas5gr0glxuya.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1740907174/zu0axslohm1az2t10ymi.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1740851650/lcvcbe14pmkiab2aoaw7.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1740851649/p2aeeppeqeagdmjg8aib.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1740851650/w2jhdcglse4gcvl3zyaf.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1740851650/rldwj0s5wkzade2xkptv.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1740851649/g7c5sv7luhqqstwvrefl.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1740907175/zfpzxslgmakwrfhgsl1s.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1740851649/xkv0zyy1ny2srqpukvrt.webp",
    ]
  },
  {
    id: 8,
    title: "Crema Rwanda",
    category: "Film Production",
    year: "2024",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1729845443/Crema_lemonade_noehwv.webm",
    mediaType: "video",
    description:
      "Crema is a specialty coffee shop in the heart of Musanze, Rwanda, offering a unique blend of coffee, community, and creativity.\n\nCrema partnered with us to elevate its online presence through strategic digital marketing and content creation. Our goal was to visually capture the café's vibrant atmosphere, unique products, and inviting charm, making it more engaging for customers online.\n\nWe developed a cohesive content strategy that included high-quality videos, and photographs to showcase Crema's ambiance, signature drinks, and the newly launched lounge. By consistently posting visually appealing and engaging content, we helped grow their Instagram audience, increase customer interaction, and strengthen their brand identity in the digital space.",
    credits: [
      { label: "Client", value: "Crema Rwanda" },
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1729845354/cremaf3_ih3pv2.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1729845349/crema1_lmodrc.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1729845352/crema2_ulcvlu.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1729845355/cremaco2_i4s1n7.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1729845355/crema5_jf9gsn.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1729845350/crema3_nmknlq.webp",
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1729845443/Crema_lemonade_noehwv.webm",
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1729845445/Crema_v1_tviacg.webm",
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1729845443/crema_rr_s7gbjd.webm",

    ]
  },
  {
    id: 9,
    title: "Studio of African Wildlife Art",
    category: "Film Production",
    year: "2024",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1761032811/scene_90304b3f_vbqs22.webm",
    mediaType: "video",
    description:
      "Studio of African Wildlife Art (SAWA) is a wildlife art studio dedicated to fostering a vibrant community where artists can express themselves freely, connect with peers, and explore their full potential while deepening their understanding of wildlife.\n\n The studio reached out in search of a brand identity that aligns with their mission of using art as a powerful tool for conservation.  They also sought to design their website that aligns with their brand.",
    credits: [
      { label: "Client", value: "Studio of African Wildlife Art" },
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760979459/sawa_lg_1_ysckm5.png",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760979459/colors_sawa_if1al7.png",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760979463/Mockup_sawa_vfnoth.png",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760979460/bronchule_sawa_ycaott.png",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760979459/Anim_dsjkr1.gif",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760885424/sawa1_jbqbpd.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760885424/sawa3_zsjrvl.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760885424/sawa2_m26mcm.webp",
    ]
  },
  {
    id: 10,
    title: "Bel - Letting Go",
    category: "Music Video",
    year: "2024",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1760793775/kumutima_ihhoob.webm",
    mediaType: "video",
    youtubeUrl: "https://www.youtube.com/embed/PWcw0Tqy5MQ",
    description: "",
    credits: [
      { label: "Artist", value: "Bel" },
      { label: "Director", value: "Blades" },
      { label: "Assistant Director", value: "Arsene Kar" },
      { label: "DOP", value: "Emery Murenzi" },
      { label: "Editor", value: "Blades, I.Heritier" },
      { label: "Colorist", value: "I.Heritier" },
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1739373783/yga4pvdtabmyvbijllwp.webp",
    ]
  },
  {
    id: 11,
    title: "IMPAKANIZI - Ingabe",
    category: "Music Video",
    year: "2024",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1760793608/impakanizi_yxqpfb.webm",
    mediaType: "video",
    youtubeUrl: "https://www.youtube.com/embed/kg-1lmMVGqE",
    description: "",
    credits: [
      { label: "Artist", value: "IMPAKANIZI" },
      { label: "Director", value: "Arsene Kar" },
      { label: "Assistant Director", value: "Blades" },
      { label: "DOP", value: "Emery Murenzi, I.Heritier" },
      { label: "Editor", value: "Blades" },
      { label: "Gaffer", value: "Dinero" },
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1739373783/edejeuqwoyyk6hx1zhn5.webp",
    ]
  },
  {
    id: 12,
    title: "Gihanga - Nkera",
    category: "Music Video",
    year: "2024",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1730292304/yg7mjh1dnzbf520eprgo.webm",
    mediaType: "video",
    youtubeUrl: "https://www.youtube.com/embed/CkwAtORTIEM",
    description: "",
    credits: [
      { label: "Artist", value: "Gihanga" },
      { label: "Director", value: "Arsene Kar" },
      { label: "Cinematographer", value: "Ichris" },
      { label: "DOP", value: "Blades" },
      { label: "Editor", value: "Ichris, Blades, I.Heritier" },
      { label: "Colorist", value: "I.Heritier" },
      { label: "Illustrations", value: "Dinero" },
      { label: "Motion Designer", value: "I. Shumbusho Placide" },
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1739373783/edejeuqwoyyk6hx1zhn5.webp",
    ]
  },
  {
    id: 13,
    title: "Neil Lee - It's been a minute",
    category: "Music Video",
    year: "2024",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1760715227/neel_pdx6vm.webm",
    mediaType: "video",
    youtubeUrl: "https://www.youtube.com/embed/sfaNjPK5_NQ",
    description: "",
    credits: [
      { label: "Artist", value: "Neil Lee" },
      { label: "Director", value: "Blades" },
      { label: "DOP", value: "Murenzi Emery" },
      { label: "Editor and Colorist", value: "I.Heritier" },
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1739374044/zlqywurhckhlup5irq8j.webp",
    ]
  },
  {
    id: 14,
    title: "Sele - Not a mistake",
    category: "Music Video",
    year: "2024",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1760793424/sele_pbzyvl.webm",
    mediaType: "video",
    youtubeUrl: "https://www.youtube.com/embed/te2ysJ_gAAQ",
    description: "",
    credits: [
      { label: "Artist", value: "Sele" },
      { label: "Director", value: "Blades" },
      { label: "DOP", value: "Murenzi Emery" },
      { label: "Editor and Colorist", value: "I.Heritier" },
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1739374044/gy1ldledhtir8bdkddri.webp",
    ]
  },
  {
    id: 15,
    title: "JEROISMUSIC - Do or Die",
    category: "Music Video",
    year: "2024",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1760881256/dodie_vdmfju.webm",
    mediaType: "video",
    youtubeUrl: "https://www.youtube.com/embed/gA92oaB75t4",
    description: "",
    credits: [
      { label: "Artist", value: "JEROISMUSIC" },
      { label: "Director", value: "Blades" },
      { label: "DOP", value: "I.Heritier" },
      { label: "Editor and Colorist", value: "I.Heritier" },
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1739374045/necmx0yrka6mzppug8zr.webp",
    ]
  },
  {
    id: 16,
    title: "Gentil Rkd - Umwungeri",
    category: "Music Video",
    year: "2024",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1760714248/Umwungeri-2_us8ncg.webm",
    mediaType: "video",
    youtubeUrl: "https://www.youtube.com/embed/dKzphXpaVTw",
    description: "",
    credits: [
      { label: "Artist", value: "Gentil Rkd" },
      { label: "Director", value: "Blades" },
      { label: "DOP", value: "Murenzi Emery" },
      { label: "Editor", value: "Blades" },
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1739374044/qagz4gwzxp4njax8q3ly.webp",
    ]
  },
  {
    id: 17,
    title: "JEROISMUSIC - All night",
    category: "Music Video",
    year: "2024",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1760881254/alln_kiuq7h.webm",
    mediaType: "video",
    youtubeUrl: "https://www.youtube.com/embed/KdGuqNSgXZ4",
    description: "",
    credits: [
      { label: "Artist", value: "JEROISMUSIC" },
      { label: "Director", value: "Blades" },
      { label: "DOP", value: "I.Heritier" },
      { label: "Editor", value: "Blades" },
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1739374044/urxh7zrcoigugetzxxsc.webp",
    ]
  },
  {
    id: 18,
    title: "Agati Library",
    category: "Photography",
    year: "2024",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1730122235/gwtlenzolgmzqly4atc6.webp",
    mediaType: "image",
    description:
      "Our team documented the key moments of the Agati Library grand opening",
    credits: [
      { label: "Client", value: "Agati Library" },
      { label: "Videographer", value: "Blades" },
      { label: "Photographer", value: "I.Heritier" },
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1730122240/dqyd3zsbu4je5vf27jb0.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1730122235/gwtlenzolgmzqly4atc6.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1730122239/iqmz5svat56d5numkstw.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1730122486/h77gbkdcqkjvvj7waopy.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1730122232/xnmi0fpttgythdovjo5l.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1730122233/cidfr07jfjpkjuzkm68m.webp",
    ]
  },
  {
    id: 19,
    title: "Patriot BBC - Social Media",
    category: "Branding",
    year: "2025",
    thumbnail:
      "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1760978078/pat_fc9l3o.webm",
    mediaType: "video",
    description:
      "Personal Social media branding for Patriot BBC. The goal of this project was to develop a cohesive set of designs that enhance the club's visual identity.",
    credits: [
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760624272/Patriots-SMBO1_wzg424.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760624256/Patriots-SMB02_m6jmzj.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760624261/Patriots-SMB03_vnh7vs.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760624260/Patriots-SMB04_nhhbuw.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760624264/Patriots-SMB05_qwfndi.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760624259/Patriots-SMB06_njv8yf.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760624260/Patriots-SMB07_u1jqhj.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760624258/Patriots-SMB08_f6dmmo.webp",
    ]
  },
  {
    id: 20,
    title: "Nyabihu School of the Deaf",
    category: "Web Design",
    year: "2025",
    thumbnail: "https://res.cloudinary.com/dpk7o7zlw/video/upload/v1761144096/video-title-_remix__5e714d33_z7ilwq.webm",
    mediaType: "video",
    description: "We designed and developed an inclusive and accessible website for Nyabihu School of the Deaf, covering the full scope from UX design to web development.",
    credits: [
      { label: "Client", value: "Nyabihu School of the Deaf" }
    ],
    images: [
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760885013/nsd1_tvusrw.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760885012/nsd3_dgrqjb.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760885012/nsd2_yq4pua.webp",
      "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760885029/nsd4_vhmw1h.webp"
    ]
  }
];

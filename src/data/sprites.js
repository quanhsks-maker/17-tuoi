function svgToImage(svg) {
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.trim());
  return img;
}

const SVG_DATA = {
  player: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130">
      <rect x="35" y="84" width="11" height="32" rx="4" fill="#1e293b"/>
      <rect x="54" y="84" width="11" height="32" rx="4" fill="#1e293b"/>
      <rect x="32" y="110" width="16" height="9" rx="4" fill="#e2e8f0"/>
      <rect x="52" y="110" width="16" height="9" rx="4" fill="#e2e8f0"/>
      <rect x="22" y="46" width="11" height="34" rx="5" fill="#334155"/>
      <rect x="67" y="46" width="11" height="34" rx="5" fill="#334155"/>
      <rect x="30" y="44" width="40" height="44" rx="9" fill="#475569"/>
      <rect x="44" y="44" width="12" height="44" fill="#e2e8f0"/>
      <rect x="45" y="34" width="10" height="12" rx="3" fill="#e5b899"/>
      <circle cx="50" cy="24" r="15" fill="#e5b899"/>
      <path d="M35 22 c0 -12 8 -16 15 -16 c9 0 15 5 15 16 c-3 -4 -8 -6 -15 -5 c-6 -1 -12 1 -15 5 z" fill="#0f172a"/>
      <circle cx="44" cy="25" r="1.8" fill="#0f172a"/>
      <circle cx="56" cy="25" r="1.8" fill="#0f172a"/>
    </svg>
  `,

  home: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 180">
      <rect x="26" y="76" width="172" height="84" rx="6" fill="rgba(15,23,42,0.22)"/>
      <rect x="20" y="68" width="172" height="86" rx="4" fill="#e7e5e4"/>
      <rect x="20" y="138" width="172" height="16" fill="#a8a29e"/>
      <polygon points="12,70 106,24 200,70" fill="#7c2d12"/>
      <polygon points="12,70 106,30 200,70" fill="#9a3412" opacity="0.5"/>
      <rect x="86" y="96" width="40" height="58" rx="2" fill="#334155"/>
      <rect x="92" y="102" width="28" height="22" fill="#94a3b8"/>
      <rect x="36" y="94" width="34" height="28" rx="2" fill="#475569"/>
      <rect x="39" y="97" width="28" height="22" fill="#cbd5e1"/>
      <rect x="142" y="94" width="34" height="28" rx="2" fill="#475569"/>
      <rect x="145" y="97" width="28" height="22" fill="#cbd5e1"/>
      <rect x="150" y="130" width="26" height="16" rx="2" fill="#cbd5e1"/>
      <circle cx="159" cy="138" r="5" fill="#64748b"/>
    </svg>
  `,

  // PHÒNG GYM (Tông đen xám hiện đại + điểm nhấn cam đậm + biểu tượng tạ)
  gym: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 180">
      <rect x="26" y="62" width="172" height="98" rx="6" fill="rgba(15,23,42,0.25)"/>
      <rect x="20" y="54" width="172" height="98" rx="4" fill="#334155"/>
      <rect x="16" y="44" width="180" height="16" rx="3" fill="#0f172a"/>
      <rect x="20" y="60" width="172" height="6" fill="#ea580c"/>
      <rect x="32" y="78" width="96" height="58" rx="2" fill="#0f172a"/>
      <rect x="36" y="82" width="88" height="50" fill="#38bdf8" opacity="0.22"/>
      <rect x="140" y="78" width="40" height="74" rx="2" fill="#1e293b"/>
      <rect x="146" y="84" width="28" height="36" fill="#475569"/>
      <!-- Biểu tượng tạ đơn giản trên biển -->
      <rect x="86" y="28" width="40" height="6" rx="2" fill="#cbd5e1"/>
      <rect x="78" y="20" width="8" height="22" rx="2" fill="#ea580c"/>
      <rect x="126" y="20" width="8" height="22" rx="2" fill="#ea580c"/>
    </svg>
  `,

  uni: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 190">
      <rect x="26" y="62" width="214" height="110" rx="6" fill="rgba(15,23,42,0.22)"/>
      <rect x="20" y="54" width="214" height="110" rx="4" fill="#e2e8f0"/>
      <rect x="14" y="42" width="226" height="18" rx="3" fill="#1e3a5f"/>
      <rect x="20" y="106" width="214" height="6" fill="#94a3b8"/>
      <rect x="34" y="70" width="42" height="24" rx="2" fill="#334155"/>
      <rect x="106" y="70" width="42" height="24" rx="2" fill="#334155"/>
      <rect x="178" y="70" width="42" height="24" rx="2" fill="#334155"/>
      <rect x="34" y="122" width="42" height="24" rx="2" fill="#334155"/>
      <rect x="178" y="122" width="42" height="24" rx="2" fill="#334155"/>
      <rect x="96" y="118" width="62" height="46" fill="#1e293b"/>
      <rect x="102" y="124" width="23" height="40" fill="#64748b"/>
      <rect x="129" y="124" width="23" height="40" fill="#64748b"/>
      <rect x="90" y="160" width="74" height="6" fill="#cbd5e1"/>
    </svg>
  `,

  // QUÁN NET (Mặt tiền tối + dải đèn led cyan)
  net: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 180">
      <rect x="26" y="62" width="172" height="98" rx="6" fill="rgba(15,23,42,0.25)"/>
      <rect x="20" y="54" width="172" height="98" rx="4" fill="#1e293b"/>
      <rect x="16" y="42" width="180" height="18" rx="3" fill="#0f172a"/>
      <rect x="28" y="48" width="156" height="6" rx="2" fill="#06b6d4"/>
      <rect x="34" y="78" width="90" height="46" rx="2" fill="#0f172a"/>
      <rect x="38" y="82" width="82" height="38" fill="#06b6d4" opacity="0.28"/>
      <rect x="136" y="78" width="42" height="74" rx="2" fill="#334155"/>
      <rect x="142" y="84" width="30" height="36" fill="#0f172a"/>
    </svg>
  `,

  // PHÒNG KHÁM / HIỆU THUỐC (Trắng sạch + chữ thập đỏ)
  clinic: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 180">
      <rect x="26" y="60" width="172" height="100" rx="6" fill="rgba(15,23,42,0.22)"/>
      <rect x="20" y="52" width="172" height="100" rx="4" fill="#f1f5f9"/>
      <rect x="16" y="42" width="180" height="14" rx="3" fill="#0f766e"/>
      <rect x="94" y="18" width="24" height="24" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="103" y="23" width="6" height="14" fill="#dc2626"/>
      <rect x="99" y="27" width="14" height="6" fill="#dc2626"/>
      <rect x="34" y="74" width="44" height="30" rx="2" fill="#bae6fd"/>
      <rect x="134" y="74" width="44" height="30" rx="2" fill="#bae6fd"/>
      <rect x="86" y="102" width="40" height="50" rx="2" fill="#0f766e"/>
      <rect x="92" y="108" width="28" height="38" fill="#cbd5e1"/>
    </svg>
  `,

  // TIỆM CẦM ĐỒ (Biển đỏ đô + cửa cuốn sắt xám)
  pawn: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 180">
      <rect x="26" y="64" width="172" height="96" rx="6" fill="rgba(15,23,42,0.24)"/>
      <rect x="20" y="56" width="172" height="96" rx="4" fill="#d6d3d1"/>
      <rect x="16" y="42" width="180" height="22" rx="3" fill="#991b1b"/>
      <rect x="52" y="49" width="108" height="8" rx="2" fill="#fde047" opacity="0.85"/>
      <rect x="34" y="80" width="144" height="72" rx="2" fill="#475569"/>
      <path d="M34 94 h144 M34 108 h144 M34 122 h144 M34 136 h144" stroke="#334155" stroke-width="2.5"/>
      <rect x="84" y="102" width="44" height="50" fill="#1e293b"/>
    </svg>
  `,

  work: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 190">
      <rect x="34" y="34" width="178" height="140" rx="6" fill="rgba(15,23,42,0.25)"/>
      <rect x="28" y="26" width="178" height="140" rx="4" fill="#475569"/>
      <rect x="24" y="20" width="186" height="12" rx="2" fill="#1e293b"/>
      <rect x="42" y="44" width="150" height="22" rx="2" fill="#1e293b"/>
      <rect x="46" y="48" width="142" height="14" fill="#38bdf8" opacity="0.35"/>
      <rect x="42" y="76" width="150" height="22" rx="2" fill="#1e293b"/>
      <rect x="46" y="80" width="142" height="14" fill="#38bdf8" opacity="0.35"/>
      <rect x="42" y="108" width="150" height="22" rx="2" fill="#1e293b"/>
      <rect x="46" y="112" width="142" height="14" fill="#38bdf8" opacity="0.35"/>
      <rect x="88" y="138" width="58" height="28" fill="#0f172a"/>
      <rect x="94" y="142" width="46" height="24" fill="#64748b"/>
    </svg>
  `,

  shop: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 180">
      <rect x="28" y="64" width="170" height="96" rx="6" fill="rgba(15,23,42,0.22)"/>
      <rect x="22" y="56" width="170" height="96" rx="4" fill="#d6d3d1"/>
      <rect x="16" y="48" width="182" height="22" rx="3" fill="#292524"/>
      <rect x="34" y="84" width="88" height="44" rx="2" fill="#1c1917"/>
      <rect x="38" y="88" width="80" height="36" fill="#78716c" opacity="0.45"/>
      <rect x="32" y="128" width="92" height="8" fill="#78350f"/>
      <rect x="136" y="84" width="40" height="68" rx="2" fill="#57534e"/>
      <rect x="142" y="90" width="28" height="30" fill="#a8a29e"/>
    </svg>
  `,

  park: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200">
      <rect x="10" y="14" width="220" height="172" rx="20" fill="#3f6212" stroke="#365314" stroke-width="4"/>
      <rect x="18" y="22" width="204" height="156" rx="14" fill="#4d7c0f"/>
      <path d="M118 22 q14 78 -10 156" fill="none" stroke="#94a3b8" stroke-width="22" stroke-linecap="round"/>
      <ellipse cx="64" cy="112" rx="32" ry="24" fill="#0369a1"/>
      <ellipse cx="62" cy="110" rx="24" ry="16" fill="#0284c7" opacity="0.6"/>
      <rect x="148" y="86" width="48" height="10" rx="2" fill="#78350f"/>
      <rect x="148" y="99" width="48" height="8" rx="2" fill="#92400e"/>
      <circle cx="170" cy="144" r="14" fill="#166534"/>
      <circle cx="186" cy="150" r="10" fill="#15803d"/>
    </svg>
  `,

  tree: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 130">
      <ellipse cx="60" cy="114" rx="28" ry="9" fill="rgba(15,23,42,0.22)"/>
      <rect x="54" y="76" width="12" height="38" rx="3" fill="#5c3a21"/>
      <circle cx="42" cy="60" r="22" fill="#166534"/>
      <circle cx="78" cy="60" r="22" fill="#166534"/>
      <circle cx="60" cy="40" r="26" fill="#15803d"/>
      <circle cx="52" cy="34" r="10" fill="#22c55e" opacity="0.35"/>
    </svg>
  `
};

export function loadSprites() {
  const sprites = {};
  for (const [key, svg] of Object.entries(SVG_DATA)) {
    sprites[key] = svgToImage(svg);
  }
  return sprites;
}
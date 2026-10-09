export function HomeWave({variant="soft"}:{variant?:"soft"|"warm"}){
 return <div aria-hidden="true" className={"home-wave home-wave-"+variant}>
  <svg viewBox="0 0 1440 60" preserveAspectRatio="none" focusable="false">
   <path d="M0 29C170 3 290 45 454 27S735 3 880 27 1111 53 1251 24 1378 14 1440 27" fill="none" stroke="currentColor" strokeWidth="1.3"/>
   <path d="M0 36C170 10 290 52 454 34S735 10 880 34 1111 60 1251 31 1378 21 1440 34" fill="none" stroke="currentColor" strokeWidth=".7" opacity=".45"/>
  </svg>
 </div>;
}

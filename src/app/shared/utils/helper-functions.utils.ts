export const paletteObj: { [key: string]: string[] } = {
    oceanBreeze: ['#006d77', '#83c5be', '#edf6f9'],
    oceanBlueSerenity: ['#064789', '#427aa1', '#ebf2fa'],
    moonlitOcean: ['#2b2d42', '#8d99ae', '#edf2f4'],
    neonSunshineBliss: ['#0d3b66', '#f4d35e', '#faf0ca'],
    lemonZestDelight: ['#283618', '#606c38', '#fefae0'],
    mysticalFairyTale: ['#1e1e24', '#92140c', '#fff8f0'],
    sunsetFlamencoDance: ['#3d405b', '#1c2541', '#0b132b'],
    darkForestGlow: ['#0c1618', '#004643', '#faf4d3'],
    whimsicalLavenderDreams: ['#9381ff', '#b8b8ff', '#f8f7ff'],
    midnightBlueSerenade: ['#3a506b', '#1c2541', '#0b132b'],
    cozyEarthTones: ['#cb997e', '#ddbea9', '#ffe8d6'],
    cherryOceanSunset: ['#00798c', '#d1495b', '#edae49'],
    deepSeaCitrus: ['#233d4d', '#fe7f2d', '#fcca46'],
    pastelDreamyTrio: ['#aab2ff', '#eca0ff', '#84ffc9'],
    boldFireGlow: ['#222', '#ff0000', '#ffe100'],
    purpleSunsetGlow: ['#540d6e', '#ee4266', '#ffd23f'],
    greenEnchatedForest: ['#243e36', '#7ca982', '#f1f7ed'],
    autumnNightSky: ['#222', '#e28413', '#fbf5f3'],
    vibrantSummerSky: ['#00a6ed', '#f6511d', '#ffb400'],
    sandyBeachRetreat: ['#8fc0a9', '#c8d5b9', '#faf3dd'],
    oceanSunsetBliss: ['#264653', '#2a9d8f', '#e9c46a'],
    fieryNightSky: ['#003049', '#d62828', '#f77f00'],
    steelTomato: ['steelblue', 'cyan', 'tomato']
  };

export function colorPalettes(palette: string): string[] {
  // const paletteObj: { [key: string]: string[] } = {
  //   oceanBreeze: ['#006d77', '#83c5be', '#edf6f9'],
  //   oceanBlueSerenity: ['#064789', '#427aa1', '#ebf2fa'],
  //   moonlitOcean: ['#2b2d42', '#8d99ae', '#edf2f4'],
  //   neonSunshineBliss: ['#0d3b66', '#f4d35e', '#faf0ca'],
  //   lemonZestDelight: ['#283618', '#606c38', '#fefae0'],
  //   mysticalFairyTale: ['#1e1e24', '#92140c', '#fff8f0'],
  //   sunsetFlamencoDance: ['#3d405b', '#1c2541', '#0b132b'],
  //   darkForestGlow: ['#0c1618', '#004643', '#faf4d3'],
  //   whimsicalLavenderDreams: ['#9381ff', '#b8b8ff', '#f8f7ff'],
  //   midnightBlueSerenade: ['#3a506b', '#1c2541', '#0b132b'],
  //   cozyEarthTones: ['#cb997e', '#ddbea9', '#ffe8d6'],
  //   cherryOceanSunset: ['#00798c', '#d1495b', '#edae49'],
  //   deepSeaCitrus: ['#233d4d', '#fe7f2d', '#fcca46'],
  //   pastelDreamyTrio: ['#aab2ff', '#eca0ff', '#84ffc9'],
  //   boldFireGlow: ['#222', '#ff0000', '#ffe100'],
  //   purpleSunsetGlow: ['#540d6e', '#ee4266', '#ffd23f'],
  //   greenEnchatedForest: ['#243e36', '#7ca982', '#f1f7ed'],
  //   autumnNightSky: ['#222', '#e28413', '#fbf5f3'],
  //   vibrantSummerSky: ['#00a6ed', '#f6511d', '#ffb400'],
  //   sandyBeachRetreat: ['#8fc0a9', '#c8d5b9', '#faf3dd'],
  //   oceanSunsetBliss: ['#264653', '#2a9d8f', '#e9c46a'],
  //   fieryNightSky: ['#003049', '#d62828', '#f77f00'],
  //   steelTomato: ['steelblue', 'cyan', 'tomato']
  // };

  return paletteObj[palette];
}

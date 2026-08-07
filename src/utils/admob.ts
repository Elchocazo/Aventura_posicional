import { AdMob, RewardAdOptions } from '@capacitor-community/admob';

// ID de prueba oficial de Google AdMob para anuncios de video recompensados
// Cuando tengas tu ID real de AdMob en produccion, solo cambias esta constante:
export const ADMOB_REWARDED_AD_ID = 'ca-app-pub-3940256099942544/5224354917';

export const initAdMob = async () => {
  try {
    await AdMob.initialize({
      initializeForTesting: true,
    });
  } catch (e) {
    console.log('AdMob init status:', e);
  }
};

export const showRealRewardedAd = async (): Promise<boolean> => {
  try {
    const options: RewardAdOptions = {
      adId: ADMOB_REWARDED_AD_ID,
    };
    await AdMob.prepareRewardVideoAd(options);
    const reward = await AdMob.showRewardVideoAd();
    return !!reward;
  } catch (e) {
    console.error('Error al mostrar anuncio de AdMob:', e);
    return false;
  }
};

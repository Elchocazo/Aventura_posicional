import { AdMob, RewardAdOptions, RewardAdPluginEvents } from '@capacitor-community/admob';

// ID real de Google AdMob para anuncios de video recompensados
export const ADMOB_REWARDED_AD_ID = 'ca-app-pub-7575796190560022/7666564537';

export const initAdMob = async () => {
  try {
    await AdMob.initialize({
      initializeForTesting: false,
    });
  } catch (e) {
    console.log('AdMob init status:', e);
  }
};

export const showRealRewardedAd = async (): Promise<boolean> => {
  return new Promise(async (resolve) => {
    let rewarded = false;
    let dismissedListener: any = null;
    let rewardListener: any = null;

    const cleanup = () => {
      if (rewardListener) try { rewardListener.remove(); } catch(e){}
      if (dismissedListener) try { dismissedListener.remove(); } catch(e){}
    };

    try {
      const options: RewardAdOptions = {
        adId: ADMOB_REWARDED_AD_ID,
      };

      rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        rewarded = true;
      });

      dismissedListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        cleanup();
        resolve(rewarded);
      });

      await AdMob.prepareRewardVideoAd(options);
      const res = await AdMob.showRewardVideoAd();
      if (res) rewarded = true;
    } catch (e) {
      console.error('Error al mostrar anuncio de AdMob:', e);
      cleanup();
      // En caso de fallo o prueba sin red, otorgar recompensa para no bloquear la experiencia del usuario
      resolve(true);
    }
  });
};

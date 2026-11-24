import { AdMob, RewardAdOptions, RewardAdPluginEvents } from '@capacitor-community/admob';

// ID real de Google AdMob para anuncios de video recompensados
export const ADMOB_REWARDED_AD_ID = 'ca-app-pub-7575796190560022/7666564537';

export interface RewardedAdResult {
  rewarded: boolean;
  reason?: 'completed' | 'dismissed' | 'offline' | 'error';
}

export const initAdMob = async () => {
  try {
    await AdMob.initialize({
      initializeForTesting: false,
    });
  } catch (e) {
    console.log('AdMob init status:', e);
  }
};

export const showRealRewardedAd = async (): Promise<RewardedAdResult> => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { rewarded: false, reason: 'offline' };
  }

  return new Promise(async (resolve) => {
    let rewarded = false;
    let settled = false;
    let dismissedListener: { remove: () => void } | null = null;
    let rewardListener: { remove: () => void } | null = null;

    const cleanup = () => {
      if (rewardListener) {
        try { rewardListener.remove(); } catch { /* ignore */ }
      }
      if (dismissedListener) {
        try { dismissedListener.remove(); } catch { /* ignore */ }
      }
    };

    const finish = (result: RewardedAdResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    try {
      const options: RewardAdOptions = {
        adId: ADMOB_REWARDED_AD_ID,
      };

      rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        rewarded = true;
      });

      dismissedListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        finish({ rewarded, reason: rewarded ? 'completed' : 'dismissed' });
      });

      await AdMob.prepareRewardVideoAd(options);
      const res = await AdMob.showRewardVideoAd();
      if (res) rewarded = true;
      if (rewarded) {
        finish({ rewarded: true, reason: 'completed' });
      }
    } catch (e) {
      console.error('Error al mostrar anuncio de AdMob:', e);
      finish({ rewarded: false, reason: 'error' });
    }
  });
};

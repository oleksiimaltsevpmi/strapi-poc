/* ------- CONFIGURATION ---------*/
const Platforms = {
  IOLITE: 'iolite',
  NATASHA: 'natasha',
}
​
const PLATFORM_NATASHA_URI = "https://parimatch.co.tz";
const PLATFORM_IOLITE_URI = "https://new.parimatch.co.tz";
const COOKIE_DOMAINS = '.parimatch.co.tz';
​
const COOKIE_ACCOUNT_NUMBER = 'accountNumber';
const COOKIE_EXPIRE_IN = 1.555e+7;
const COOKIE_PLATFORM_KEY = 'CF_SPLITTER_PLATFORM';
const COOKIE_PLATFORM_SET_KV_VALUE = 'CF_SPLITTER_PLATFORM_SET_KV_VALUE';
const FILES_TYPE_REGEX = new RegExp('(?:/|^)[^./]+$');
const KV_NAMESPACE = 'SPLIT_KV_SPACE'
const REDIRECT_STATUS_CODE = 307;
​
/* ------- END CONFIGURATION ---------*/
function getCookie(name, cookie) {
  const value = `; ${cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}
​
class ResponseBuilder {
  constructor(request, response) {
    this.response = response;
    this.request = request;
    this.cookie = this.request.headers.get('cookie');
  }
​
  async buildResponse() {
    return this.response;
  }
​
  redirectToIoliotePlatform() {
    this.response = Response.redirect(PLATFORM_IOLITE_URI, REDIRECT_STATUS_CODE);
  }
​
  redirectToNatashaPlatform() {
    this.response = Response.redirect(PLATFORM_NATASHA_URI, REDIRECT_STATUS_CODE);
  }
}
​
class NoAuthenticatedBuilder extends ResponseBuilder {
  constructor(request, response) {
    super(request, response);
  }
​
  getPlatform() {
    return getCookie(COOKIE_PLATFORM_KEY, this.cookie);
  }
​
  setPlatform(platform) {
    this.response.headers.append('Set-Cookie',`${COOKIE_PLATFORM_KEY}=${platform}; Domain=${COOKIE_DOMAINS}; Max-Age=${COOKIE_EXPIRE_IN}; Path=/; Secure`)
  }
}
​
class AuthenticatedBuilder extends ResponseBuilder {
  constructor(request, response, userId, KV) {
    super(request, response);
    this.userId = userId;
    this.KV = KV;
​
        this.keys = { platform: `user:${this.userId}:platform` }
  }
​
  getPrioritizePlatform() {
    return getCookie(COOKIE_PLATFORM_SET_KV_VALUE, this.cookie);
  }
​
  removePrioritizePlatformFromCookie() {
    this.response.headers.append('Set-Cookie',`${COOKIE_PLATFORM_SET_KV_VALUE}=; Domain=${COOKIE_DOMAINS}; Max-Age=0; Path=/; Secure`)
  }
​
  async getPlatform() {
    const platformFromKV = await this.KV.get(this.keys.platform);
    const platformFromCookie = getCookie(COOKIE_PLATFORM_KEY, this.cookie);
    const platformPrioritizePlatform = this.getPrioritizePlatform();
​
        if (platformPrioritizePlatform) {
          await this.setPlatform(platformPrioritizePlatform);
          this.removePrioritizePlatformFromCookie();
​
            return platformPrioritizePlatform;
        }
​
        if (!platformFromKV && platformFromCookie) {
          await this.setPlatform(platformFromCookie);
        }
​
        return (platformFromKV || platformFromCookie);
  }
​
  async setPlatform(platform) {
    await this.KV.put(this.keys.platform, platform);
  }
}
​
async function newDomainBuilderExecutor(request, response, builder) {
  const platform = await builder.getPlatform();
​
    if (!platform) {
      await builder.setPlatform(Platforms.IOLITE)
    }
​
    if (platform === Platforms.NATASHA) {
      builder.redirectToNatashaPlatform()
    }
​
    return builder.buildResponse();
}
​
async function oldDomainBuilderExecutor(request, response, builder) {
  const platform = await builder.getPlatform();
​
    if (!platform) {
      await builder.setPlatform(Platforms.NATASHA)
    }
​
    if (platform === Platforms.IOLITE) {
      builder.redirectToIoliotePlatform();
    }
​
    return builder.buildResponse();
}
​
export default {
  async fetch(
    request,
    env,
    ctx
  ) {
    const { host, pathname } =  new URL(request.url);
    const isFileExt = pathname !== '/' && !FILES_TYPE_REGEX.test(request.url)
​
        if (isFileExt) {
          return fetch(request);
        }
​
        const { host: oldPlatformHost } =  new URL(PLATFORM_NATASHA_URI);
​
        let response = await fetch(request.url);
    response = new Response(response.body, response);
​
        const userId = getCookie(COOKIE_ACCOUNT_NUMBER, request.headers.get('cookie'));
​
        const builder = userId ?
          new AuthenticatedBuilder(
            request,
            response,
            userId,
            env[KV_NAMESPACE],
          ) : new NoAuthenticatedBuilder(request, response);
​
        let resultResponse;
​
        if (host === oldPlatformHost) {
          resultResponse = await oldDomainBuilderExecutor(request, response, builder);
        } else {
          resultResponse = await newDomainBuilderExecutor(request, response, builder);
        }
​
        return resultResponse;
  },
};

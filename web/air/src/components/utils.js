import { API, showError } from '../helpers';

export async function getOAuthState() {
  const res = await API.get('/api/oauth/state');
  const { success, message, data } = res.data;
  if (success) {
    return data;
  } else {
    showError(message);
    return '';
  }
}

export async function onGitHubOAuthClicked(github_client_id) {
  const state = await getOAuthState();
  if (!state) return;
  window.open(
    `https://github.com/login/oauth/authorize?client_id=${github_client_id}&state=${state}&scope=user:email`
  );
}

export async function onOIDCOAuthClicked() {
  const state = await getOAuthState();
  if (!state) return;
  const { status } = await API.get('/api/status');
  if (status.oidc_well_known) {
    // 使用 well-known 配置
    const authEndpoint = status.oidc_authorization_endpoint || `${status.oidc_well_known}auth`;
    window.open(
      `${authEndpoint}?response_type=code&client_id=${status.oidc_client_id}&state=${state}&redirect_uri=${window.location.origin}/api/oauth/oidc&scope=openid profile email`
    );
  } else {
    // 使用固定端点
    window.open(
      `${status.oidc_authorization_endpoint}?response_type=code&client_id=${status.oidc_client_id}&state=${state}&redirect_uri=${window.location.origin}/api/oauth/oidc&scope=openid profile email`
    );
  }
}
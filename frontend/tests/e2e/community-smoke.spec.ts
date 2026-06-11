import { expect, test } from '@playwright/test';

test.describe('community smoke journey', () => {
  test('public visitor can browse active community content', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /CMS Community/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /실시간 커뮤니티|게시판/ })).toBeVisible();
  });

  test('member posting controls require or use an authenticated session', async ({ page }) => {
    await page.goto('/write');
    await expect(page.getByText('로그인이 필요합니다.')).toBeVisible();
    await page.getByLabel('이메일').fill('member@example.com');
    await page.getByLabel('비밀번호').fill('password1234');
    await page.getByRole('button', { name: '로그인' }).click();
    await expect(page.getByRole('link', { name: /글쓰기/ })).toBeVisible();
  });

  test('admin and moderation entry points are role aware', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('이메일').fill('admin@example.com');
    await page.getByLabel('비밀번호').fill('password1234');
    await page.getByRole('button', { name: '로그인' }).click();
    await expect(page.getByRole('link', { name: /관리자/ }).first()).toBeVisible();
    await page.getByRole('link', { name: /관리자/ }).first().click();
    await expect(page.getByRole('heading', { name: /운영 현황/ })).toBeVisible();
  });
});

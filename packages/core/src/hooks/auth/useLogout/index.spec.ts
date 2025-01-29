import { renderHook, waitFor } from "@testing-library/react";

import { TestWrapper, act, mockRouterProvider, queryClient } from "@test";

import { useCheckError, useOnError } from "../useOnError";
import { useLogout } from "./";

const mockGo = jest.fn();

const routerProvider = mockRouterProvider({
  fns: {
    go: () => mockGo,
  },
});

// NOTE : Will be removed in v5
describe("v3LegacyAuthProviderCompatible useLogout Hook", () => {
  beforeEach(() => {
    mockGo.mockReset();

    jest.spyOn(console, "error").mockImplementation((message) => {
      if (
        message?.message === "Logout rejected" ||
        typeof message === "undefined"
      )
        return;

      console.warn(message);
    });
  });

  it("logout and redirect to login", async () => {
    const { result } = renderHook(
      () => useLogout({ v3LegacyAuthProviderCompatible: true }),
      {
        wrapper: TestWrapper({
          legacyAuthProvider: {
            isProvided: true,
            login: () => Promise.resolve(),
            checkAuth: () => Promise.resolve(),
            checkError: () => Promise.resolve(),
            getPermissions: () => Promise.resolve(),
            logout: () => {
              return Promise.resolve();
            },
            getUserIdentity: () => Promise.resolve(),
          },
          routerProvider,
        }),
      },
    );

    const { mutateAsync: logout } = result.current;

    await act(async () => {
      await logout();
    });

    await waitFor(() => {
      return !result.current?.isLoading;
    });

    await act(async () => {
      expect(mockGo).toBeCalledWith({ to: "/login" });
    });
  });

  it("logout and not redirect", async () => {
    const { result } = renderHook(
      () => useLogout({ v3LegacyAuthProviderCompatible: true }),
      {
        wrapper: TestWrapper({
          legacyAuthProvider: {
            isProvided: true,
            login: () => Promise.resolve(),
            checkAuth: () => Promise.resolve(),
            checkError: () => Promise.resolve(),
            getPermissions: () => Promise.resolve(),
            logout: () => {
              return Promise.resolve(false);
            },
            getUserIdentity: () => Promise.resolve(),
          },
          routerProvider,
        }),
      },
    );

    const { mutateAsync: logout } = result.current;

    await act(async () => {
      await logout();
    });

    await waitFor(() => {
      return !result.current?.isLoading;
    });

    await act(async () => {
      expect(mockGo).not.toBeCalled();
    });
  });

  it("logout and redirect to custom path", async () => {
    const { result } = renderHook(
      () =>
        useLogout<{ redirectPath: string }>({
          v3LegacyAuthProviderCompatible: true,
        }),
      {
        wrapper: TestWrapper({
          legacyAuthProvider: {
            isProvided: true,
            login: () => Promise.resolve(),
            checkAuth: () => Promise.resolve(),
            checkError: () => Promise.resolve(),
            getPermissions: () => Promise.resolve(),
            logout: ({ redirectPath }) => {
              return Promise.resolve(redirectPath);
            },
            getUserIdentity: () => Promise.resolve(),
          },
          routerProvider,
        }),
      },
    );

    const { mutateAsync: logout } = result.current;

    await act(async () => {
      await logout({ redirectPath: "/custom-path" });
    });

    await waitFor(() => {
      return result.current?.status === "success";
    });

    await act(async () => {
      expect(mockGo).toBeCalledWith({ to: "/custom-path" });
    });
  });

  it("logout rejected", async () => {
    const { result } = renderHook(
      () => useLogout({ v3LegacyAuthProviderCompatible: true }),
      {
        wrapper: TestWrapper({
          legacyAuthProvider: {
            isProvided: true,
            login: () => Promise.resolve(),
            checkAuth: () => Promise.resolve(),
            checkError: () => Promise.resolve(),
            getPermissions: () => Promise.resolve(),
            logout: () => Promise.reject(new Error("Logout rejected")),
            getUserIdentity: () => Promise.resolve(),
          },
        }),
      },
    );

    const { mutateAsync: logout } = result.current;

    await act(async () => {
      try {
        await logout();
      } catch (error) {
        expect(error).toEqual(new Error("Logout rejected"));
      }
    });
  });

  it("logout rejected with undefined error", async () => {
    const { result } = renderHook(
      () => useLogout({ v3LegacyAuthProviderCompatible: true }),
      {
        wrapper: TestWrapper({
          legacyAuthProvider: {
            isProvided: true,
            login: () => Promise.resolve(),
            checkAuth: () => Promise.resolve(),
            checkError: () => Promise.resolve(),
            getPermissions: () => Promise.resolve(),
            logout: () => Promise.reject(),
            getUserIdentity: () => Promise.resolve(),
          },
        }),
      },
    );

    const { mutateAsync: logout } = result.current;

    await act(async () => {
      try {
        await logout();
      } catch (error) {
        expect(error).not.toBeDefined();
      }
    });
  });

  it("logout and not redirect if check error rejected with false", async () => {
    const { result } = renderHook(() => useCheckError(), {
      wrapper: TestWrapper({
        legacyAuthProvider: {
          isProvided: true,
          login: () => Promise.resolve(),
          checkAuth: () => Promise.resolve(),
          checkError: () => Promise.reject(false),
          getPermissions: () => Promise.resolve(),
          logout: () => Promise.resolve(),
          getUserIdentity: () => Promise.resolve(),
        },
      }),
    });

    const { mutate: checkError } = result.current;

    await act(async () => {
      await checkError({});
    });

    await waitFor(() => {
      expect(!result.current.isLoading).toBeTruthy();
    });

    await act(async () => {
      expect(mockGo).toBeCalledTimes(0);
    });
  });

  it("logout and not redirect if logout resolved false", async () => {
    const { result } = renderHook(() => useCheckError(), {
      wrapper: TestWrapper({
        legacyAuthProvider: {
          isProvided: true,
          login: () => Promise.resolve(),
          checkAuth: () => Promise.resolve(),
          checkError: () => Promise.reject(),
          getPermissions: () => Promise.resolve(),
          logout: () => Promise.resolve(false),
          getUserIdentity: () => Promise.resolve(),
        },
        routerProvider,
      }),
    });

    const { mutate: checkError } = result.current;

    await act(async () => {
      await checkError({});
    });

    await waitFor(() => {
      expect(!result.current.isLoading).toBeTruthy();
    });

    await act(async () => {
      expect(mockGo).toBeCalledTimes(0);
    });
  });

  it("logout and redirect to resolved custom path", async () => {
    const { result } = renderHook(
      () => useLogout({ v3LegacyAuthProviderCompatible: true }),
      {
        wrapper: TestWrapper({
          legacyAuthProvider: {
            isProvided: true,
            login: () => Promise.resolve(),
            checkAuth: () => Promise.resolve(),
            checkError: () => Promise.reject(),
            getPermissions: () => Promise.resolve(),
            logout: () => Promise.resolve("/custom-path"),
            getUserIdentity: () => Promise.resolve(),
          },
          routerProvider,
        }),
      },
    );

    const { mutate: logout } = result.current;

    await act(async () => {
      await logout();
    });

    await waitFor(() => {
      return result.current?.status === "success";
    });

    await act(async () => {
      expect(mockGo).toBeCalledWith({ to: "/custom-path" });
    });
  });
});

describe("useLogout Hook", () => {
  const mockAuthProvider = {
    login: () => Promise.resolve({ success: false }),
    check: () => Promise.resolve({ authenticated: false }),
    onError: () => Promise.resolve({}),
  };

  beforeEach(() => {
    mockGo.mockReset();
    jest.spyOn(console, "error").mockImplementation((message) => {
      if (
        message?.message === "Logout rejected" ||
        typeof message === "undefined"
      )
        return;

      console.warn(message);
    });
  });

  it("logout and redirect to login", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: TestWrapper({
        authProvider: {
          ...mockAuthProvider,
          logout: () => {
            return Promise.resolve({
              success: true,
              redirectTo: "/login",
            });
          },
        },
        routerProvider,
      }),
    });

    const { mutateAsync: logout } = result.current;

    await act(async () => {
      await logout();
    });

    await waitFor(() => {
      return !result.current?.isLoading;
    });

    await act(async () => {
      expect(mockGo).toBeCalledWith({ to: "/login" });
    });
  });

  it("logout and not redirect", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: TestWrapper({
        authProvider: {
          ...mockAuthProvider,
          logout: () => {
            return Promise.resolve({
              success: true,
            });
          },
        },
      }),
    });

    const { mutateAsync: logout } = result.current;

    await act(async () => {
      await logout();
    });

    await waitFor(() => {
      return !result.current?.isLoading;
    });

    await act(async () => {
      expect(mockGo).not.toBeCalled();
    });
  });

  it("logout and redirect to custom path, pass redirect with hook's param", async () => {
    const { result } = renderHook(() => useLogout<{ redirectPath: string }>(), {
      wrapper: TestWrapper({
        authProvider: {
          ...mockAuthProvider,
          logout: () => {
            return Promise.resolve({
              success: true,
            });
          },
        },
        routerProvider,
      }),
    });

    const { mutateAsync: logout } = result.current;

    await act(async () => {
      await logout({ redirectPath: "/custom-path" });
    });

    await act(async () => {
      expect(mockGo).toBeCalledWith(
        expect.objectContaining({ to: "/custom-path" }),
      );
    });
  });

  it("logout and redirect to custom path, pass redirect with authProvider return value", async () => {
    const { result } = renderHook(() => useLogout<{ redirectPath: string }>(), {
      wrapper: TestWrapper({
        authProvider: {
          ...mockAuthProvider,
          logout: () => {
            return Promise.resolve({
              success: true,
              redirectTo: "/custom-path",
            });
          },
        },
        routerProvider,
      }),
    });

    const { mutateAsync: logout } = result.current;

    await act(async () => {
      await logout();
    });

    await act(async () => {
      expect(mockGo).toBeCalledWith({ to: "/custom-path" });
    });
  });

  it("logout rejected", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: TestWrapper({
        authProvider: {
          login: () => Promise.resolve({ success: true }),
          check: () => Promise.resolve({ authenticated: true }),
          onError: () => Promise.resolve({}),
          logout: () => {
            return Promise.resolve({
              success: false,
              error: new Error("Logout rejected"),
            });
          },
        },
      }),
    });

    const { mutateAsync: logout } = result.current;

    await act(async () => {
      await logout();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({
        success: false,
        error: new Error("Logout rejected"),
      });
    });
  });

  it("logout rejected with undefined error", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: TestWrapper({
        authProvider: {
          ...mockAuthProvider,
          logout: () => {
            return Promise.resolve({
              success: false,
            });
          },
        },
      }),
    });

    const { mutateAsync: logout } = result.current;
    await act(async () => {
      await logout();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({
        success: false,
      });
    });

    expect(result.current.data?.error).toBeUndefined();
  });

  it("logout and not redirect if success false", async () => {
    const { result } = renderHook(() => useOnError(), {
      wrapper: TestWrapper({
        authProvider: {
          ...mockAuthProvider,
          logout: () => {
            return Promise.resolve({
              success: false,
            });
          },
        },
      }),
    });

    const { mutate: onError } = result.current;

    await act(async () => {
      await onError({});
    });

    await waitFor(() => {
      expect(!result.current.isLoading).toBeTruthy();
    });

    await act(async () => {
      expect(mockGo).toBeCalledTimes(0);
    });
  });

  it("should open notification when has error is true", async () => {
    const openNotificationMock = jest.fn();

    const { result } = renderHook(() => useLogout(), {
      wrapper: TestWrapper({
        notificationProvider: {
          open: openNotificationMock,
          close: jest.fn(),
        },
        authProvider: {
          ...mockAuthProvider,
          logout: () =>
            Promise.resolve({
              success: false,
              error: new Error("Error"),
            }),
        },
      }),
    });

    const { mutate: forgotPassword } = result.current;

    await act(async () => {
      forgotPassword({});
    });

    await waitFor(() => {
      expect(openNotificationMock).toBeCalledWith({
        key: "useLogout-error",
        type: "error",
        message: "Error",
        description: "Error",
      });
    });
  });

  it("should open notification when has success is false, error is undefined", async () => {
    const openNotificationMock = jest.fn();

    const { result } = renderHook(() => useLogout(), {
      wrapper: TestWrapper({
        notificationProvider: {
          open: openNotificationMock,
          close: jest.fn(),
        },
        authProvider: {
          ...mockAuthProvider,
          logout: () => Promise.resolve({ success: false }),
        },
      }),
    });

    const { mutate: forgotPassword } = result.current;

    await act(async () => {
      forgotPassword({});
    });

    await waitFor(() => {
      expect(openNotificationMock).toBeCalledWith({
        key: "useLogout-error",
        type: "error",
        message: "Logout Error",
        description: "Something went wrong during logout",
      });
    });
  });

  it("should open notification when throw error", async () => {
    const openNotificationMock = jest.fn();

    const { result } = renderHook(() => useLogout(), {
      wrapper: TestWrapper({
        notificationProvider: {
          open: openNotificationMock,
          close: jest.fn(),
        },
        authProvider: {
          ...mockAuthProvider,
          logout: () => {
            throw new Error("Unhandled error");
          },
        },
      }),
    });

    const { mutate: forgotPassword } = result.current;

    await act(async () => {
      forgotPassword({});
    });

    await waitFor(() => {
      expect(openNotificationMock).toBeCalledWith({
        key: "useLogout-error",
        type: "error",
        message: "Error",
        description: "Unhandled error",
      });
    });
  });

  it("should override `mutationFn` with mutationOptions.mutationFn", async () => {
    const logoutMock = jest.fn().mockResolvedValue({ data: {} });
    const mutationFnMock = jest.fn().mockResolvedValue({ data: {} });

    const { result } = renderHook(
      () =>
        useLogout({
          mutationOptions: {
            // mutationFn is omitted in types. So we need to use @ts-ignore test it.
            // @ts-ignore
            mutationFn: mutationFnMock,
          },
        }),
      {
        wrapper: TestWrapper({
          authProvider: {
            ...mockAuthProvider,
            logout: logoutMock,
          },
        }),
      },
    );

    result.current.mutate({});

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(logoutMock).not.toBeCalled();
    expect(mutationFnMock).toBeCalled();
  });

  it("should override `mutationKey` with `mutationOptions.mutationKey`", async () => {
    const logoutMock = jest.fn().mockResolvedValue({ data: {} });

    const { result } = renderHook(
      () =>
        useLogout({
          mutationOptions: {
            mutationKey: ["foo", "bar"],
          },
        }),
      {
        wrapper: TestWrapper({
          authProvider: {
            ...mockAuthProvider,
            logout: logoutMock,
          },
        }),
      },
    );

    result.current.mutate({});

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(
      queryClient.getMutationCache().findAll({
        mutationKey: ["foo", "bar"],
      }),
    ).toHaveLength(1);
  });

  it("should open success notification when successNotification is passed", async () => {
    const openNotificationMock = jest.fn();

    const successNotification = {
      message: "Logged out successfully!",
      description: "Operation completed successfully",
    };

    const { result } = renderHook(() => useLogout(), {
      wrapper: TestWrapper({
        notificationProvider: {
          open: openNotificationMock,
          close: jest.fn(),
        },
        authProvider: {
          ...mockAuthProvider,
          logout: () =>
            Promise.resolve({
              success: true,
              successNotification,
            }),
        },
      }),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(openNotificationMock).toHaveBeenCalledWith({
      key: "logout-success",
      type: "success",
      message: "Logged out successfully!",
      description: "Operation completed successfully",
    });
  });
});

// NOTE : Will be removed in v5
describe("useLogout Hook authProvider selection", () => {
  it("selects new authProvider", async () => {
    const legacyLogoutMock = jest.fn(() => Promise.resolve());
    const logoutMock = jest.fn(() =>
      Promise.resolve({
        success: true,
      }),
    );

    const { result } = renderHook(() => useLogout(), {
      wrapper: TestWrapper({
        legacyAuthProvider: {
          login: () => Promise.resolve(),
          checkAuth: () => Promise.resolve(),
          checkError: () => Promise.resolve(),
          logout: () => legacyLogoutMock(),
        },
        authProvider: {
          login: () => Promise.resolve({ success: true }),
          check: () => Promise.resolve({ authenticated: true }),
          onError: () => Promise.resolve({}),
          logout: () => logoutMock(),
        },
      }),
    });

    const { mutate: login } = result.current;

    await act(async () => {
      login({});
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(legacyLogoutMock).not.toHaveBeenCalled();
    expect(logoutMock).toHaveBeenCalled();
  });

  it("selects v3LegacyAuthProviderCompatible authProvider", async () => {
    const legacyLogoutMock = jest.fn(() => Promise.resolve());
    const logoutMock = jest.fn(() => Promise.resolve({ success: true }));

    const { result } = renderHook(
      () => useLogout({ v3LegacyAuthProviderCompatible: true }),
      {
        wrapper: TestWrapper({
          legacyAuthProvider: {
            login: () => Promise.resolve(),
            checkAuth: () => Promise.resolve(),
            checkError: () => Promise.resolve(),
            logout: () => legacyLogoutMock(),
          },
          authProvider: {
            login: () => Promise.resolve({ success: true }),
            check: () => Promise.resolve({ authenticated: true }),
            onError: () => Promise.resolve({}),
            logout: () => logoutMock(),
          },
        }),
      },
    );

    const { mutate: login } = result.current;

    await act(async () => {
      login({});
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(legacyLogoutMock).toHaveBeenCalled();
    expect(logoutMock).not.toHaveBeenCalled();
  });
});

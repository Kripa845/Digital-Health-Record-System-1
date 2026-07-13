const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const deleteAccount = async (
    token: string,
    password: string
) => {

    const response = await fetch(
        `${API_URL}/patient-profile/delete-me/`,
        {
            method: "DELETE",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
                password,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail);
    }

    return data;
};
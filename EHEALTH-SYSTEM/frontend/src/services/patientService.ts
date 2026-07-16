import { API_BASE } from '../config/api';

const API_URL = API_BASE;

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
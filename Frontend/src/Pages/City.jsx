import React, { useState } from "react";

const cities = [
  {
    name: "کابل",
    branches: ["شعبه مرکز", "شعبه کارته‌نو", "شعبه دهمزنگ"],
  },
  {
    name: "هرات",
    branches: ["شعبه مرکز", "شعبه شهرک ساحلی"],
  },
  {
    name: "مزار شریف",
    branches: ["شعبه مرکزی"],
  },
  {
    name: "کندز",
    branches: ["شعبه مرکزی", "شعبه ولسوالی امام صاحب"],
  },
];

export default function City() {
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [requested, setRequested] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fromCity || !toCity) {
      alert("لطفاً شهر مبدا و مقصد را انتخاب کنید.");
      return;
    }
    if (fromCity === toCity) {
      alert("شهر مبدا و مقصد نباید یکسان باشند.");
      return;
    }

    // اینجا می‌توانید درخواست را به سرور ارسال کنید یا کارهای لازم را انجام دهید
    setRequested(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        شهرهای تحت پوشش و درخواست موتر
      </h1>

      {/* نمایش شهرها و نمایندگی‌ها */}
      <section className="max-w-4xl mx-auto mb-12">
        <h2 className="text-2xl font-semibold mb-6">شهرها و نمایندگی‌ها</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cities.map((city) => (
            <div
              key={city.name}
              className="border rounded-lg p-6 shadow-md bg-white"
            >
              <h3 className="text-xl font-bold mb-3">{city.name}</h3>
              <p className="font-semibold mb-2">نمایندگی‌ها:</p>
              <ul className="list-disc list-inside text-gray-700">
                {city.branches.map((branch, idx) => (
                  <li key={idx}>{branch}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* فرم درخواست موتر */}
      <section className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          درخواست موتر از یک شهر به شهر دیگر
        </h2>
        {requested ? (
          <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded text-center">
            درخواست شما ثبت شد! به زودی با شما تماس خواهیم گرفت.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label
                htmlFor="fromCity"
                className="block mb-2 font-medium text-gray-700"
              >
                شهر مبدا
              </label>
              <select
                id="fromCity"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">شهر خود را انتخاب کنید</option>
                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="toCity"
                className="block mb-2 font-medium text-gray-700"
              >
                شهر مقصد
              </label>
              <select
                id="toCity"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">شهر مقصد را انتخاب کنید</option>
                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-primary text-white py-3 rounded hover:bg-primary-dark transition"
            >
              ارسال درخواست
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

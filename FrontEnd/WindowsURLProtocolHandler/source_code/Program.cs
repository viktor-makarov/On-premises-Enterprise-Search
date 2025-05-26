//Приложение получает на вход в качестве первого параметра путь к файлу или папке, 
//но этот формат не подходит для передачи в explorer.exe т.к. он был предварительно encoded браузером
//Поэтому сначала нужно вернуть путь в первозданный вид (decode), а потом передать в explorer.exe, 
// чтобы файл или папка открыись для пользователя.


using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace OpenFileOrDirectoryExplorer
{
    class Program
    {
        static void Main(string[] args)
        {
            var rawPath = "";
            if (args == null || args.Length == 0)
            {
                rawPath = "explorerreff:%5C%5Caorti.ru%5Cshare%5C%D0%A0%D0%A2%D0%98%20USGAAP%5CWorking%20papers%5C%D0%A0%D0%B5%D0%B3%D0%BB%D0%B0%D0%BC%D0%B5%D0%BD%D1%82%D1%8B%20%D0%B8%20%D0%B1%D0%BB%D0%B0%D0%BD%D0%BA%D0%B8%5C%D0%A0%D0%B5%D0%B3%D0%BB%D0%B0%D0%BC%D0%B5%D0%BD%D1%82%D1%8B%20%D0%9E%D0%90%D0%9E%20%D0%A0%D0%A2%D0%98%5C%D0%9F%D0%BE%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BE%D0%B1%20%D1%83%D0%BF%D1%80%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D0%B8%20%D0%BC%D0%B5%D1%82%D0%BE%D0%B4%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8%D0%B8,%20%D1%84%D0%B8%D0%BD%D0%B0%D0%BD%D1%81%D0%BE%D0%B2%D0%BE%D0%B3%D0%BE%20%D1%83%D1%87%D0%B5%D1%82%D0%B0%20%D0%B8%20%D0%BE%D1%82%D1%87%D0%B5%D1%82%D0%BD%D0%BE%D1%81%D1%82%D0%B8";
            }
            else
            {
            rawPath = args[0];
            }
           // rawPath = rawPath.Replace("+", " ");
            var pathToFile = System.Uri.UnescapeDataString(rawPath);
            pathToFile = pathToFile.Replace("explorerreff:", "");
            System.Diagnostics.Process p = new System.Diagnostics.Process();
            p.StartInfo = new System.Diagnostics.ProcessStartInfo("explorer.exe");
            p.StartInfo.CreateNoWindow = true;
            p.StartInfo.UseShellExecute = false;
            p.StartInfo.WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden;
            p.StartInfo.Arguments = pathToFile;
            p.Start();


        }
    }
}

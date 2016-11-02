// Code generated by Microsoft (R) AutoRest Code Generator 0.16.0.0
// Changes may cause incorrect behavior and will be lost if the code is
// regenerated.

namespace Microsoft.Bot.Connector
{
    using System;
    using System.Linq;
    using System.Collections.Generic;
    using Newtonsoft.Json;
    using Microsoft.Rest;
    using Microsoft.Rest.Serialization;

    /// <summary>
    /// Channel account information needed to route a message
    /// </summary>
    public partial class ChannelAccount
    {
        /// <summary>
        /// Initializes a new instance of the ChannelAccount class.
        /// </summary>
        public ChannelAccount() { }

        /// <summary>
        /// Initializes a new instance of the ChannelAccount class.
        /// </summary>
        public ChannelAccount(string id = default(string), string name = default(string))
        {
            Id = id;
            Name = name;
        }

        /// <summary>
        /// Channel id for the user or bot on this channel (Example:
        /// joe@smith.com, or @joesmith or 123456)
        /// </summary>
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        /// <summary>
        /// Display friendly name
        /// </summary>
        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

    }
}
